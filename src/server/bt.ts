import { BluetoothState, CharAddr } from '../types'
import noble, { Characteristic, Peripheral } from '@abandonware/noble'
import { error, info, longCharacteristicUUID } from './utils'

let initialized = false

export function setupBluetooth({
    onDiscover,
    onScanStart,
    onScanStop,
    onStateChange,
}: {
    onDiscover?: (device: Peripheral) => void
    onScanStart?: () => void
    onScanStop?: () => void
    onStateChange?: (state: BluetoothState) => void
} = {}) {
    if (initialized) {
        throw new Error('Noble already set up')
    }

    initialized = true

    if (onScanStart) {
        noble.on('scanStart', onScanStart)
    }

    if (onScanStop) {
        noble.on('scanStop', onScanStop)
    }

    if (onStateChange) {
        noble.on('stateChange', (state) => {
            if (isBluetoothState(state)) {
                onStateChange(state)
            }
        })
    }

    if (onDiscover) {
        noble.on('discover', onDiscover)
    }

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
        onDeviceReady,
        onDeviceSetupDone,
        onDisconnect,
        onUuid,
    }: {
        onBeforeConnect?: (device: Peripheral) => void
        onBeforeDiscoveringCharacteristics?: (device: Peripheral) => void
        onBeforeUpdatingCharacteristics?: (device: Peripheral) => void
        onCharacteristicDiscover?: (characteristic: Characteristic) => void | Promise<void>
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

            for (let i = 0; i < nextCharacteristics.length; i++) {
                const ch = nextCharacteristics[i]

                const uuid = longCharacteristicUUID(ch.uuid)

                onUuid?.(uuid, ch)

                requireConnected()

                switch (uuid) {
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
