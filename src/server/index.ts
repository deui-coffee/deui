#!/usr/bin/env node

import { Buffer } from 'buffer'
import EventEmitter from 'events'
import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import noble, { Characteristic } from '@abandonware/noble'
import {
    BluetoothState,
    CharAddr,
    MMRAddr,
    MsgType,
    RefillPreset,
    RemoteState,
    SteamSetting,
} from '../types'
import {
    error,
    info,
    watchCharacteristic,
    broadcast,
    send,
    wsServer,
    startDeuiServer,
} from './utils'
import production from './middlewares/production'
import development from './middlewares/development'
import getDefaultRemoteState from '../utils/getDefaultRemoteState'
import { produce } from 'immer'
import { setupBluetooth, setupDe1 } from './bt'
import { router } from './router'
import { rescue } from './middlewares/errors'
import { MMREventEmitter, sleep, toU16P8, toU8P0 } from '../shared/utils'
import { toEncodedShotSettings } from '../utils/shot'

const app = express()

app.use(express.static('public'))

app.use(bodyParser.json())

app.use(morgan('dev'))

app.use(production())

app.use(development())

startDeuiServer(app, {
    port: Number(process.env.PORT) || 3001,
})

app.use(
    router({
        scan() {
            noble.startScanning([], false)
        },
        getRemoteState() {
            return State
        },
        getCharacteristic(uuid) {
            return characteristics[uuid]
        },
        setProfile(profile) {
            setState({
                profile,
            })
        },
    })
)

app.use(rescue())

let State: RemoteState = getDefaultRemoteState()

let characteristicValues: Partial<Record<string, string>> = {}

let characteristics: Partial<Record<string, Characteristic>> = {}

let mmrData: Partial<Record<MMRAddr, Buffer>> = {}

const emitter = new MMREventEmitter()

function setMmrData(addr: MMRAddr, data: Buffer) {
    mmrData[addr] = data

    emitter.emit('read', addr, data)
}

function setCharacteristicValue(uuid: string, data: Buffer) {
    const encodedData = data.toString('base64')

    characteristicValues[uuid] = encodedData

    broadcast({
        type: MsgType.Characteristics,
        payload: {
            [uuid]: encodedData,
        },
    })

    if (uuid !== CharAddr.ReadFromMMR) {
        return
    }

    /**
     * 0 => 4 bytes, 1 => 8 bytes, …, n => (n + 1) * 4
     */
    const len = (data.readUint8() + 1) * 4

    setMmrData(Buffer.from([0, ...data.subarray(1, 4)]).readUint32BE(), data.subarray(4, 4 + len))
}

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

wsServer.on('connection', (ws) => {
    info('New client')

    send(ws, {
        type: MsgType.State,
        payload: State,
    })

    send(ws, {
        type: MsgType.Characteristics,
        payload: characteristicValues,
    })

    ws.on('close', () => void info('Client disconnected'))

    ws.on('error', () => void error('Shit did happen, eh?'))

    ws.on('message', (data) => void info('Received %s', data))
})

setupBluetooth({
    onScanStart() {
        setState({ scanning: true })
    },

    onScanStop() {
        setState({ scanning: false })
    },

    onStateChange(bluetoothState) {
        setState({ bluetoothState })

        if (bluetoothState !== BluetoothState.PoweredOn) {
            noble.stopScanning()
        }
    },

    onDiscover(device) {
        if (!/^de1(\x00)?$/i.test(device.advertisement.localName)) {
            return
        }

        info('Found DE1')

        void (async () => {
            try {
                await setupDe1(device, {
                    onBeforeDiscoveringCharacteristics() {
                        setState({
                            discoveringCharacteristics: true,
                        })
                    },

                    onBeforeUpdatingCharacteristics(de1) {
                        setState({
                            connecting: false,
                            discoveringCharacteristics: false,
                            device: JSON.parse(de1.toString()),
                            deviceReady: false,
                        })

                        characteristics = {}

                        mmrData = {}
                    },

                    onDeviceReady() {
                        setState({
                            deviceReady: true,
                        })
                    },

                    onDeviceSetupDone() {
                        setState({
                            connecting: false,
                            discoveringCharacteristics: false,
                        })
                    },

                    onBeforeConnect() {
                        setState({
                            connecting: true,
                        })
                    },

                    onCharacteristicDiscover(characteristic) {
                        return watchCharacteristic(characteristic, {
                            onData: setCharacteristicValue,
                        })
                    },

                    async onCharacteristicsReady() {
                        console.log('FAN THRESHOLD', await Mmr.read(MMRAddr.FanThreshold, 0))
                    },

                    onDisconnect() {
                        setState({
                            device: undefined,
                            deviceReady: false,
                        })

                        /**
                         * There's nothing we can do with the found device
                         * nor with the connection. It's time to start over.
                         */
                        noble.startScanning([], false)
                    },

                    onUuid(uuid, characteristic) {
                        characteristics[uuid] = characteristic
                    },
                })
            } catch (e) {
                error('Something went wrong', e)
            }
        })()
    },
})

const Mmr = {
    async read(addr: MMRAddr, length: number) {
        const buf = Buffer.alloc(20, 0)

        buf.writeUint32BE(addr)

        buf.writeUint8(length % 0xff, 0)

        const characteristic = characteristics[CharAddr.ReadFromMMR]

        if (!characteristic) {
            throw new Error('No ReadFromMMR characteristic')
        }

        let onRead: ((addr: MMRAddr, data: Buffer) => void) | undefined = undefined

        try {
            return await Promise.race([
                new Promise<Buffer>((_, reject) => {
                    sleep(10000).then(() => void reject(new Error('Timeout')))
                }),
                new Promise<Buffer>((resolve, reject) => {
                    onRead = (incomingAddr, data) => {
                        if (incomingAddr === addr) {
                            resolve(data)
                        }
                    }

                    emitter.on('read', onRead)

                    void (async () => {
                        try {
                            await characteristic.writeAsync(buf, false)
                        } catch (e) {
                            reject(e)
                        }
                    })
                }),
            ])
        } finally {
            if (onRead) {
                emitter.off('read', onRead)
            }
        }
    },
}
