import noble, { Characteristic, Peripheral } from '@abandonware/noble'
import { Application } from 'express'
import { sleep, toU16P8 } from '../shared/utils'
import { BluetoothState, CharAddr, MMRAddr, MsgType, RefillPreset } from '../shared/types'
import { Char, Mmr } from './comms'
import {
    broadcast,
    error,
    info,
    lock,
    longCharacteristicUUID,
    setRemoteState,
    watchCharacteristic,
    writeProfile,
    writeShotSettings,
} from './utils'

let initialized = false

export function setupBluetooth(app: Application) {
    if (initialized) {
        throw new Error('Noble already set up')
    }

    initialized = true

    noble.on('scanStart', () => {
        setRemoteState(app, (rs) => {
            rs.scanning = true
        })
    })

    noble.on('scanStop', () => {
        setRemoteState(app, (rs) => {
            rs.scanning = false
        })
    })

    noble.on('stateChange', (state) => {
        if (!isBluetoothState(state)) {
            return
        }

        const { bluetoothState: currentState } = app.locals.remoteState

        if (state === currentState) {
            return
        }

        setRemoteState(app, (rs) => {
            rs.bluetoothState = state
        })

        if (state === BluetoothState.PoweredOn) {
            noble.startScanning([], false)
        } else {
            noble.stopScanning()
        }
    })

    noble.on('discover', (device) => {
        if (!/^de1(\x00)?$/i.test(device.advertisement.localName)) {
            return
        }

        info('Found DE1')

        void (async () => {
            try {
                await setupDe1(device, {
                    onBeforeDiscoveringCharacteristics() {
                        setRemoteState(app, (rs) => {
                            rs.discoveringCharacteristics = true
                        })
                    },

                    onBeforeUpdatingCharacteristics(de1) {
                        setRemoteState(app, (rs) => {
                            Object.assign(rs, {
                                connecting: false,
                                discoveringCharacteristics: false,
                                device: JSON.parse(de1.toString()),
                                deviceReady: false,
                            })
                        })

                        app.locals.characteristics = {}

                        app.locals.mmrData = {}
                    },

                    onDeviceReady() {
                        setRemoteState(app, (rs) => {
                            rs.deviceReady = true
                        })
                    },

                    onDeviceSetupDone() {
                        setRemoteState(app, (rs) => {
                            Object.assign(rs, {
                                connecting: false,
                                discoveringCharacteristics: false,
                            })
                        })
                    },

                    onBeforeConnect() {
                        setRemoteState(app, (rs) => {
                            rs.connecting = true
                        })
                    },

                    onCharacteristicDiscover(characteristic) {
                        return watchCharacteristic(characteristic, {
                            onData(uuid, data) {
                                const encodedData = data.toString('base64')

                                app.locals.characteristicValues[uuid as CharAddr] = encodedData

                                broadcast(app.locals.wss, {
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

                                const mmrAddr = Buffer.from([
                                    0,
                                    ...data.subarray(1, 4),
                                ]).readUint32BE() as MMRAddr

                                const mmrData = data.subarray(4, 4 + len)

                                app.locals.mmrData[mmrAddr] = mmrData

                                Mmr.receive(mmrAddr, data)
                            },
                        })
                    },

                    onCharacteristicsReady() {
                        return lock(app, async () => {
                            /**
                             * @todo We may consider checking for GHC like so
                             * await Mmr.read(app, MMRAddr.GHCInfo, 0)
                             */

                            const profile = await writeProfile(app, 'default')

                            await Mmr.write(app, MMRAddr.FanThreshold, Mmr.formatUint32(60))

                            await writeShotSettings(app, undefined, { profile })

                            await Mmr.write(app, MMRAddr.TargetSteamFlow, Mmr.formatUint32(250))

                            await Mmr.write(app, MMRAddr.SteamStartSecs, Mmr.formatUint32(70)) // 0.7s

                            await Char.write(
                                app,
                                CharAddr.WaterLevels,
                                Buffer.from([
                                    ...Char.formatUint16(toU16P8(0)),
                                    ...Char.formatUint16(toU16P8(5)),
                                ])
                            )

                            /**
                             * @todo We may want to check the board model:
                             * await Mmr.read(app, MMRAddr.CPUBoardModel, 2)
                             */

                            await Mmr.tweakHeaters(app)

                            /**
                             * @todo We may want read refill kit info here:
                             * await Mmr.read(app, MMRAddr.RefillKitPresent, 0)
                             */

                            /**
                             * @todo We may want to read the serial number here:
                             * await Mmr.read(app, MMRAddr.SerialN, 0)
                             */

                            /**
                             * In reality, the refill kit setting is more complex. We're going with the
                             * default values. For more info see:
                             * https://github.com/decentespresso/de1app/blob/21b6664b826301c07204ed3eaf21f785e049c129/de1plus/de1_comms.tcl#L1138-L1153
                             */
                            await Mmr.write(
                                app,
                                MMRAddr.RefillKitPresent,
                                Mmr.formatUint32(RefillPreset.AutoDetect)
                            )

                            /**
                             * @todo We may want to deal with calibration, You'd read the current
                             * multiplier like so:
                             * await Mmr.read(app, MMRAddr.CalFlowEst, 0)
                             */

                            await sleep(5000)

                            await Char.read(app, CharAddr.StateInfo)

                            await sleep(7000)

                            await Mmr.read(app, MMRAddr.HeaterV, 1)
                        })
                    },

                    onDisconnect() {
                        setRemoteState(app, (rs) => {
                            Object.assign(rs, {
                                device: undefined,
                                deviceReady: false,
                            })
                        })

                        /**
                         * The old set of characteristics is stale at this
                         * point. We're gonna get a new one once we connect
                         * to the machine again.
                         */
                        app.locals.characteristics = {}

                        /**
                         * Similar story. We may wanna broadcast these.
                         */
                        app.locals.characteristicValues = {}

                        /**
                         * And with MMR reads.
                         */
                        app.locals.mmrData = {}

                        /**
                         * There's nothing we can do with the found device
                         * nor with the connection. It's time to start over.
                         */
                        noble.startScanning([], false)
                    },

                    onUuid(uuid, characteristic) {
                        app.locals.characteristics[uuid] = characteristic
                    },
                })
            } catch (e) {
                error('Something went wrong', e)
            }
        })()
    })

    process.on('SIGINT', teardown)

    process.on('SIGQUIT', teardown)

    process.on('SIGTERM', teardown)
}

function isBluetoothState(value: string): value is BluetoothState {
    return (
        value === BluetoothState.PoweredOff ||
        value === BluetoothState.PoweredOn ||
        value === BluetoothState.Resetting ||
        value === BluetoothState.Unauthorized ||
        value === BluetoothState.Unknown ||
        value === BluetoothState.Unsupported
    )
}

function teardown() {
    noble.stopScanning(() => void process.exit())
}

export async function setupDe1(
    de1: Peripheral,
    {
        onBeforeConnect,
        onBeforeDiscoveringCharacteristics,
        onBeforeUpdatingCharacteristics,
        onCharacteristicDiscover,
        onCharacteristicsReady,
        onConnect,
        onDeviceReady,
        onDeviceSetupDone,
        onDisconnect,
        onUuid,
    }: {
        onBeforeConnect?: (device: Peripheral) => void
        onBeforeDiscoveringCharacteristics?: (device: Peripheral) => void
        onBeforeUpdatingCharacteristics?: (device: Peripheral) => void
        onCharacteristicDiscover?: (characteristic: Characteristic) => void | Promise<void>
        onCharacteristicsReady?: () => Promise<void>
        onConnect?: () => void
        onDeviceReady?: (device: Peripheral) => void
        onDeviceSetupDone?: (device: Peripheral) => void
        onDisconnect?: () => void
        onUuid?: (uuid: string, characteristic: Characteristic) => void
    } = {}
) {
    de1.once('disconnect', (reason) => {
        info('Disconnected. Reason: %s', reason)

        onDisconnect?.()
    })

    de1.once('connect', async (err) => {
        info('Connected to DE1. Setting up.')

        onConnect?.()

        function requireConnected() {
            if (de1.state !== 'connected') {
                throw new Error('Device not connected')
            }
        }

        try {
            if (err) {
                throw err
            }

            onBeforeDiscoveringCharacteristics?.(de1)

            requireConnected()

            const { characteristics: nextCharacteristics } =
                await de1.discoverAllServicesAndCharacteristicsAsync()

            onBeforeUpdatingCharacteristics?.(de1)

            for (const ch of nextCharacteristics) {
                const uuid = longCharacteristicUUID(ch.uuid)

                onUuid?.(uuid, ch)

                requireConnected()

                switch (uuid) {
                    case CharAddr.ReadFromMMR:
                    case CharAddr.StateInfo:
                    case CharAddr.WaterLevels:
                    case CharAddr.Temperatures:
                    case CharAddr.ShotSample:
                    case CharAddr.ShotSettings:
                    case CharAddr.HeaderWrite:
                    case CharAddr.FrameWrite:
                        await onCharacteristicDiscover?.(ch)
                        break
                    default:
                }
            }

            requireConnected()

            await onCharacteristicsReady?.()

            requireConnected()

            onDeviceReady?.(de1)
        } catch (e) {
            error('Connect failed', e)
        } finally {
            onDeviceSetupDone?.(de1)
        }
    })

    info('Stopping the scan…')

    await noble.stopScanningAsync()

    info('Connecting to DE1…')

    onBeforeConnect?.(de1)

    await de1.connectAsync()
}
