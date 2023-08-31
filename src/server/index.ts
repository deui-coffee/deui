#!/usr/bin/env node

import { Buffer } from 'buffer'
import { IncomingMessage, createServer } from 'http'
import morgan from 'morgan'
import express, { Response } from 'express'
import bodyParser from 'body-parser'
import noble, { Characteristic } from '@abandonware/noble'
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
import production from './middlewares/production'
import development from './middlewares/development'
import getDefaultRemoteState from '../utils/getDefaultRemoteState'
import { produce } from 'immer'

const app = express()

app.use(express.static('public'))

app.use(bodyParser.json())

app.use(morgan('dev'))

app.use(production())

app.use(development())

const Port = process.env.PORT || 3001

createServer(app)
    .on('upgrade', upgrade)
    .listen(Port, () => void info('Listening on %d…', Port))

app.get('/', (_, res) => {
    res.status(404).end()
})

let State: RemoteState = getDefaultRemoteState()

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
                deviceReady: false,
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
            deviceReady: true,
        })
    })

    device.once('disconnect', (err) => {
        if (err) {
            return void error('Disconnect failed: %s', err)
        }

        setState({
            device: undefined,
            deviceReady: false,
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

            /**
             * The following makes the whole writing stuck (esp. at writing the tail shot
             * frame). Leaving it commented out for now. Maybe I find a reason one day and
             * give it another chance.
             */
            // const actual = await characteristic.readAsync()

            // if (actual.toString('hex') !== data.toString('hex')) {
            //     error('Data mismatch (expected vs actual)', data, actual)
            // }

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
        .or(z.literal(ShotExecMethod.ShotSettings))
        .or(z.literal(ShotExecMethod.ShotBeginProfileWrite))
        .or(z.literal(ShotExecMethod.ShotEndProfileWrite)),
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
        case ShotExecMethod.ShotBeginProfileWrite:
        case ShotExecMethod.ShotEndProfileWrite:
            if (command.method === ShotExecMethod.ShotBeginProfileWrite && !State.profile.ready) {
                /**
                 * Reject attempts to write new profile structure if one is already being written.
                 */
                return void res.status(409).json({ code: ServerErrorCode.AlreadyWritingShot })
            }

            setState({
                profile: {
                    id: Buffer.from(command.params as any, 'hex').toString(),
                    ready: command.method === ShotExecMethod.ShotEndProfileWrite,
                },
            })

            return void res.status(200).end()
        default:
            break
    }

    writeCharacteristic(charAddr, Buffer.from(command.params as any, 'hex'))(req, res)
})

function setState(fn: Partial<RemoteState> | ((state: RemoteState) => void)) {
    State = produce(
        State,
        typeof fn === 'function'
            ? fn
            : (draft) => {
                  Object.assign(draft, fn)
              }
    )

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
