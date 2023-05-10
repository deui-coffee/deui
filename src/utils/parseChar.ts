import { Machine, Property } from '$/types'
import { Buffer } from 'buffer'
import { CharAddr } from './cafehub'

type Fn = (wireBytes: Buffer) => Partial<Machine>

type Fns = Partial<Record<CharAddr, Fn>>

const fallbackFn: Fn = () => ({})

const fns: Fns = {
    [CharAddr.Temperatures](wb) {
        return {
            [Property.WaterHeater]: wb.readUint16BE(0) / 256, // 1°C every 256
            [Property.SteamHeater]: wb.readUint16BE(2) / 256,
            [Property.GroupHeater]: wb.readUint16BE(4) / 256,
            [Property.ColdWater]: wb.readUint16BE(6) / 256,
            [Property.TargetWaterHeater]: wb.readUint16BE(8) / 256,
            [Property.TargetSteamHeater]: wb.readUint16BE(10) / 256,
            [Property.TargetGroupHeater]: wb.readUint16BE(12) / 256,
            [Property.TargetColdWater]: wb.readUint16BE(14) / 256,
        }
    },
    [CharAddr.WaterLevels](wb) {
        return {
            [Property.WaterLevel]: wb.readUint16BE() / 256 / 50, // 0-50mm
        }
    },
    [CharAddr.StateInfo](wb) {
        return {
            [Property.MajorState]: wb.readUint8(0),
            [Property.MinorState]: wb.readUint8(1),
        }
    },
    [CharAddr.RequestedState](wb) {
        return {
            [Property.MajorState]: wb.readUint8(0),
        }
    },
    [CharAddr.ShotSample](wb) {
        return {
            // U16 SampleTime
            [Property.ShotSampleTime]: wb.readUint16BE(0),
            // U16P12 GroupPressure
            [Property.ShotGroupPressure]: wb.readUint16BE(2),
            // U16P12 GroupFlow
            [Property.ShotGroupFlow]: wb.readUInt16BE(4),
            // U16P8  MixTemp
            [Property.ShotMixTemp]: wb.readUInt16BE(6),
            // U24P16 HeadTemp
            [Property.ShotHeadTemp]: wb.readUintBE(8, 3),
            // U16P8  SetMixTemp
            [Property.ShotSetMixTemp]: wb.readUInt16BE(9),
            // U16P8  SetHeadTemp
            [Property.ShotSetHeadTemp]: wb.readUInt16BE(11),
            // U8P4   SetGroupPressure
            [Property.ShotSetGroupPressure]: wb.readUInt8(13),
            // U8P4   SetGroupFlow
            [Property.ShotSetGroupFlow]: wb.readUInt8(14),
            // U8P0   FrameNumber
            [Property.ShotFrameNumber]: wb.readUInt8(15),
            // U8P0   SteamTemp
            [Property.ShotSteamTemp]: wb.readUInt8(16),
        }
    },
}

export default function parseChar(char: CharAddr, encodedWireBytes: string): ReturnType<Fn> {
    return (fns[char] || fallbackFn)(Buffer.from(encodedWireBytes, 'base64'))
}
