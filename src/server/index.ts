import { Buffer } from 'buffer'
import { IncomingMessage, createServer } from 'http'
import morgan from 'morgan'
import cors from 'cors'
import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import noble, { Characteristic } from '@abandonware/noble'
import { createProxyMiddleware } from 'http-proxy-middleware'
import {
    BluetoothState,
    CharAddr,
    MajorState,
    MsgType,
    RemoteState,
    ServerErrorCode,
    ShotExecCommand,
    ShotExecMethod,
} from '../types'
import { error, info, longCharacteristicUUID, watchCharacteristic } from './utils'
import { broadcast, upgrade, wsServer } from './ws'
import { z } from 'zod'

const app = express()

app.use(express.static('public'))

app.use(bodyParser.json())

app.use(morgan('dev'))

app.use(cors())

app.use(
    createProxyMiddleware(
        (pathname: string, req: Request) => {
            return req.method !== 'POST' || !/^\/(scan|on|off|exec)/.test(pathname)
        },
        {
            target: 'http://127.0.0.1:3000',
            changeOrigin: true,
        }
    )
)

const Port = process.env.PORT || 3000

createServer(app)
    .on('upgrade', upgrade)
    .listen(Port, () => void info('Listening on %d…', Port))

app.get('/', (_, res) => {
    res.status(404).end()
})

let State: RemoteState = {
    bluetoothState: BluetoothState.Unknown,
    scanning: false,
    connecting: false,
    discoveringCharacteristics: false,
    device: undefined,
    ready: false,
}

app.post('/scan', (_, res) => {
    if (State.bluetoothState !== 'poweredOn') {
        return void res.status(409).json({ code: ServerErrorCode.NotPoweredOn })
    }

    if (State.scanning) {
        return void res.status(409).json({ code: ServerErrorCode.AlreadyScanning })
    }

    if (State.connecting) {
        return void res.status(409).json({ code: ServerErrorCode.AlreadyConnecting })
    }

    if (State.device) {
        return void res.status(409).json({ code: ServerErrorCode.AlreadyConnected })
    }

    try {
        noble.startScanning([], false)

        res.status(200).json({})
    } catch (e) {
        error('startScanning error', e)

        res.status(503).end()
    }
})

let characteristicValues: Partial<Record<string, string>> = {}

let characteristics: Partial<Record<string, Characteristic>> = {}

function setCharacteristicValue(uuid: string, data: Buffer) {
    const encodedData = data.toString('base64')

    characteristicValues[uuid] = encodedData

    broadcast({
        type: MsgType.Characteristics,
        payload: {
            [uuid]: encodedData,
        },
    })
}

noble.on('discover', (device) => {
    const {
        state,
        advertisement: { localName },
    } = device

    if (localName !== 'DE1') {
        return
    }

    if (state !== 'disconnected') {
        return void info('DE1 found. State: %s. Doing nothing.', state)
    }

    info('DE1 found')

    device.once('connect', (err) => {
        if (err) {
            setState({
                connecting: false,
            })

            return void error('Connect failed: %s', err)
        }

        setState({
            discoveringCharacteristics: true,
        })

        device.discoverAllServicesAndCharacteristics(async (err, _, nextCharacteristics) => {
            if (err) {
                setState({
                    connecting: false,
                    discoveringCharacteristics: false,
                })

                return void error('discoverAllServicesAndCharacteristics failed: %s', err)
            }

            characteristics = {}

            setState({
                connecting: false,
                discoveringCharacteristics: false,
                device: JSON.parse(device.toString()),
            })

            for (let i = 0; i < nextCharacteristics.length; i++) {
                const ch = nextCharacteristics[i]

                const uuid = longCharacteristicUUID(ch.uuid)

                characteristics[uuid] = ch

                switch (uuid) {
                    case CharAddr.StateInfo:
                    case CharAddr.WaterLevels:
                    case CharAddr.Temperatures:
                    case CharAddr.ShotSample:
                    case CharAddr.ShotSettings:
                    case CharAddr.HeaderWrite:
                    case CharAddr.FrameWrite:
                        await watchCharacteristic(ch, { onData: setCharacteristicValue })
                        break
                    default:
                }
            }
        })

        info('Connected')

        setState({
            ready: true,
        })
    })

    device.once('disconnect', (err) => {
        if (err) {
            return void error('Disconnect failed: %s', err)
        }

        setState({
            device: undefined,
            ready: false,
        })

        info('Disconnected')

        // Start over!
        noble.startScanning([], false)
    })

    info('Connecting…')

    try {
        noble.stopScanning(() => {
            setState({
                connecting: true,
            })

            try {
                device.connect()
            } catch (e) {
                error('connect failed', e)
            }
        })
    } catch (e) {
        error('stopScanning failed', e)
    }
})

function writeCharacteristic(
    uuid: string,
    data: Buffer,
    { withoutResponse = false }: { withoutResponse?: boolean } = {}
) {
    return async (_: IncomingMessage, res: Response) => {
        const { device } = State

        if (!device) {
            return void res.status(409).json({ code: ServerErrorCode.NotConnected })
        }

        const characteristic = characteristics[uuid]

        if (!characteristic) {
            return void res.status(422).json({ code: ServerErrorCode.UnknownCharacteristic })
        }

        try {
            await characteristic.writeAsync(data, withoutResponse)

            res.status(200).end()
        } catch (e) {
            error('`write` failed: %s', e)

            return void res.status(500).end()
        }
    }
}

app.post('/on', writeCharacteristic(CharAddr.RequestedState, Buffer.from([MajorState.Idle])))

app.post('/off', writeCharacteristic(CharAddr.RequestedState, Buffer.from([MajorState.Sleep])))

const ExecCommand = z.object({
    method: z
        .literal(ShotExecMethod.Frame)
        .or(z.literal(ShotExecMethod.Header))
        .or(z.literal(ShotExecMethod.Tail))
        .or(z.literal(ShotExecMethod.ShotSettings)),
    params: z.string().regex(/[a-f\d]{2,}/i),
})

function isExecCommand(arg: unknown): arg is ShotExecCommand {
    return ExecCommand.safeParse(arg).success
}

app.post('/exec', (req, res) => {
    const command = req.body

    if (!isExecCommand(command)) {
        return void res.status(404).end()
    }

    let charAddr: CharAddr = CharAddr.FrameWrite

    switch (command.method) {
        case ShotExecMethod.Header:
            charAddr = CharAddr.HeaderWrite
            break
        case ShotExecMethod.ShotSettings:
            charAddr = CharAddr.ShotSettings
            break
        default:
            break
    }

    writeCharacteristic(charAddr, Buffer.from(command.params as any, 'hex'))(req, res)
})

function setState(partial: Partial<RemoteState>) {
    State = {
        ...State,
        ...partial,
    }

    broadcast({
        type: MsgType.State,
        payload: State,
    })
}

noble.on('stateChange', (state) => {
    setState({ bluetoothState: state as BluetoothState })

    if (state !== 'poweredOn') {
        noble.stopScanning()
    }
})

noble.on('scanStart', () => void setState({ scanning: true }))

noble.on('scanStop', () => void setState({ scanning: false }))

wsServer.on('connection', (ws) => {
    info('New client')

    broadcast({
        type: MsgType.State,
        payload: State,
    })

    broadcast({
        type: MsgType.Characteristics,
        payload: characteristicValues,
    })

    ws.on('close', () => void info('Client disconnected'))

    ws.on('error', () => void error('Shit did happen, eh?'))

    ws.on('message', (data) => void info('Received %s', data))
})

process.on('SIGINT', function () {
    info('Caught interrupt signal')
    noble.stopScanning(() => void process.exit())
})

process.on('SIGQUIT', function () {
    info('Caught interrupt signal')
    noble.stopScanning(() => void process.exit())
})

process.on('SIGTERM', function () {
    info('Caught interrupt signal')
    noble.stopScanning(() => void process.exit())
})
