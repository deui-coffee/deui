import { Machine, Property } from '$/features/cafehub/types'
import { Buffer } from 'buffer'
import { CharAddr } from 'cafehub-client/types'

type Fn = (wireBytes: Buffer) => Partial<Machine>

type Fns = Partial<Record<CharAddr, Fn>>

const fallbackFn: Fn = () => ({})

const fns: Fns = {
    [CharAddr.Temperatures](wb) {
        return {
            [Property.Temperature]: wb.readUint16BE() / 256, // 1°C every 256
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
}

export default function parseChar(char: CharAddr, encodedWireBytes: string): ReturnType<Fn> {
    return (fns[char] || fallbackFn)(Buffer.from(encodedWireBytes, 'base64'))
}
