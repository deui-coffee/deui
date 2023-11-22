import { CharAddr } from '../types'

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

export function toU8P0(value: number) {
    return Math.max(0, Math.min(0xff, (value + 0.5) | 0))
}

export function toU16P8(value: number) {
    return Math.max(0, Math.min(0xffff, (value * 256 + 0.5) | 0))
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

export function sleep(millis = 1000) {
    return new Promise<void>((resolve) => void setTimeout(resolve, millis))
}
