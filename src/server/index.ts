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
    MMREventEmitter,
} from './utils'
import production from './middlewares/production'
import development from './middlewares/development'
import getDefaultRemoteState from '../utils/getDefaultRemoteState'
import { produce } from 'immer'
import { setupBluetooth, setupDe1 } from './bt'
import { router } from './router'
import { rescue } from './middlewares/errors'
import { sleep, toU16P8, toU8P0 } from '../shared/utils'
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
                        /**
                         * @todo We may consider checking for GHC like so
                         * await Mmr.read(MMRAddr.GHCInfo, 0)
                         */

                        /**
                         * @todo We may consider sending the profile here. In order to be able
                         * to do it we gotta store it somewhere. Storage is a whole another topic.
                         */

                        await Mmr.write(MMRAddr.FanThreshold, Mmr.formatUint32(60))

                        await Char.write(
                            CharAddr.ShotSettings,
                            toEncodedShotSettings({
                                SteamSettings: SteamSetting.LowPower,
                                TargetSteamTemp: toU8P0(160),
                                TargetSteamLength: toU8P0(120),
                                TargetHotWaterTemp: toU8P0(85),
                                TargetHotWaterVol: toU8P0(50),
                                TargetHotWaterLength: toU8P0(60),
                                TargetEspressoVol: toU8P0(200),
                                TargetGroupTemp: toU8P0(92),
                            })
                        )

                        await Char.write(
                            CharAddr.WaterLevels,
                            Buffer.from([
                                ...Mmr.formatUint16(toU16P8(0)),
                                ...Mmr.formatUint16(toU16P8(5)),
                            ])
                        )

                        /**
                         * @todo We may want to check the board model:
                         * await Mmr.read(MMRAddr.CPUBoardModel, 2)
                         */

                        await Mmr.tweakHeaters()

                        /**
                         * @todo We may want read refill kit info here:
                         * await Mmr.read(MMRAddr.RefillKitPresent, 0)
                         */

                        /**
                         * @todo We may want to read the serial number here:
                         * await Mmr.read(MMRAddr.SerialN, 0)
                         */

                        /**
                         * In reality, the refill kit setting is more complex. We're going with the
                         * default values. For more info see:
                         * https://github.com/decentespresso/de1app/blob/21b6664b826301c07204ed3eaf21f785e049c129/de1plus/de1_comms.tcl#L1138-L1153
                         */
                        await Mmr.write(
                            MMRAddr.RefillKitPresent,
                            Mmr.formatUint32(RefillPreset.AutoDetect, { littleEndian: true })
                        )

                        /**
                         * @todo We may want to deal with calibration, You'd read the current
                         * multiplier like so:
                         * await Mmr.read(MMRAddr.CalFlowEst, 0)
                         */

                        await sleep(5000)

                        await Char.read(CharAddr.StateInfo)

                        await sleep(7000)

                        await Mmr.read(MMRAddr.HeaterV, 1)
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

        buf.writeUint8(length, 0)

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
                    })()
                }),
            ])
        } finally {
            if (onRead) {
                emitter.off('read', onRead)
            }
        }
    },

    async write(addr: MMRAddr, value: Buffer) {
        const buf = Buffer.alloc(20, 0)

        buf.writeUint32BE(addr)

        buf.writeUint8(value.byteLength, 0)

        value.copy(buf, 4)

        const characteristic = characteristics[CharAddr.WriteToMMR]

        if (!characteristic) {
            throw new Error('No WriteToMMR characteristic')
        }

        await characteristic.writeAsync(buf, false)
    },

    async tweakHeaters() {
        await Mmr.write(MMRAddr.HeaterUp1Flow, Mmr.formatUint32(20, { littleEndian: true }))

        await Mmr.write(MMRAddr.HeaterUp2Flow, Mmr.formatUint32(40, { littleEndian: true }))

        await Mmr.write(MMRAddr.WaterHeaterIdleTemp, Mmr.formatUint32(990, { littleEndian: true }))

        await Mmr.write(MMRAddr.HeaterUp2Timeout, Mmr.formatUint32(10, { littleEndian: true }))

        await Mmr.write(MMRAddr.SteamPurgeMode, Mmr.formatUint32(0, { littleEndian: true }))

        await Mmr.writeFlushTimeout(5)

        await Mmr.writeFlushFlowRate(6)

        await Mmr.writeHotwaterFlowRate(10)
    },

    async writeHotwaterFlowRate(rate: number) {
        await Mmr.write(
            MMRAddr.HotWaterFlowRate,
            Mmr.formatUint32((rate * 10) | 0, { littleEndian: true })
        )
    },

    async writeFlushFlowRate(rate: number) {
        await Mmr.write(
            MMRAddr.FlushFlowRate,
            Mmr.formatUint32((rate * 10) | 0, { littleEndian: true })
        )
    },

    async writeFlushTimeout(seconds: number) {
        await Mmr.write(
            MMRAddr.FlushTimeout,
            Mmr.formatUint32((seconds * 10) | 0, { littleEndian: true })
        )
    },

    formatUint32(value: number, { littleEndian = false } = {}) {
        const buf = Buffer.alloc(4, 0)

        if (littleEndian) {
            buf.writeUint32LE(value)
        } else {
            buf.writeUint32BE(value)
        }

        return buf
    },

    formatUint16(value: number, { littleEndian = false } = {}) {
        const buf = Buffer.alloc(2, 0)

        if (littleEndian) {
            buf.writeUint16LE(value)
        } else {
            buf.writeUint16BE(value)
        }

        return buf
    },
}

const Char = {
    async write(addr: CharAddr, buffer: Buffer) {
        const characteristic = characteristics[addr]

        if (!characteristic) {
            throw new Error('No characteristic')
        }

        await characteristic.writeAsync(buffer, false)
    },

    async read(addr: CharAddr) {
        const characteristic = characteristics[addr]

        if (!characteristic) {
            throw new Error('No characteristic')
        }

        await characteristic.readAsync()
    },
}
