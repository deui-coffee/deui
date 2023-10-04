import { CharAddr } from '../types'
import { Characteristic } from '@abandonware/noble'
import debug from 'debug'

export const info = debug('deui-server:info')

export const error = debug('deui-server:error')

export const verbose = debug('deui-server:verbose')

export function fromF817(value: number) {
    return (value & 0x80) === 0 ? value / 10 : value & 0x7f
}

export function toF817(value: number) {
    if (value > 0x7f) {
        return 0x7f
    }

    if (value > 12.75) {
        return 0x80 | (0.5 + value)
    }

    return 0xff & (0.5 + value * 10)
}

async function subscribe(char: Characteristic) {
    try {
        await char.subscribeAsync()

        info(`Subscribed to ${char.uuid}`)
    } catch (e) {
        error('failed to subscribe')
    }
}

const charNames = {
    [CharAddr.Versions]: 'Versions',
    [CharAddr.RequestedState]: 'RequestedState',
    [CharAddr.SetTime]: 'SetTime',
    [CharAddr.ShotDirectory]: 'ShotDirectory',
    [CharAddr.ReadFromMMR]: 'ReadFromMMR',
    [CharAddr.WriteToMMR]: 'WriteToMMR',
    [CharAddr.ShotMapRequest]: 'ShotMapRequest',
    [CharAddr.DeleteShotRange]: 'DeleteShotRange',
    [CharAddr.FWMapRequest]: 'FWMapRequest',
    [CharAddr.Temperatures]: 'Temperatures',
    [CharAddr.ShotSettings]: 'ShotSettings',
    [CharAddr.Deprecated]: 'Deprecated',
    [CharAddr.ShotSample]: 'ShotSample',
    [CharAddr.StateInfo]: 'StateInfo',
    [CharAddr.HeaderWrite]: 'HeaderWrite',
    [CharAddr.FrameWrite]: 'FrameWrite',
    [CharAddr.WaterLevels]: 'WaterLevels',
    [CharAddr.Calibration]: 'Calibration',
}

export function getCharName(uuid: CharAddr) {
    return charNames[uuid]
}

export async function watchCharacteristic(
    char: Characteristic,
    { onData }: { onData?: (uuid: string, data: Buffer) => void }
) {
    const uuid = longCharacteristicUUID(char.uuid)

    const charName = getCharName(uuid)

    char.on('data', (data) => {
        verbose('Data received', charName, data)

        onData?.(uuid, data)
    })

    try {
        await char.readAsync()

        info(`Read`, charName)

        await subscribe(char)
    } catch (e) {
        error('Failed to read', charName, e)
    }
}

export function longCharacteristicUUID(uuid: string) {
    if (uuid.length !== 4) {
        throw new Error('Invalid short UUID')
    }

    return `0000${uuid}-0000-1000-8000-00805f9b34fb` as CharAddr
}
