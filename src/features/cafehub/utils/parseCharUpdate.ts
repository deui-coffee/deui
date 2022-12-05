import { MetricId } from '$/types'
import { Buffer } from 'buffer'
import { CharAddr } from 'cafehub-client/types'

type Fn = (wireBytes: Buffer) => Partial<Record<MetricId, number>>

type Fns = Partial<Record<CharAddr, Fn>>

const fallbackFn: Fn = () => ({})

const fns: Fns = {
    [CharAddr.Temperatures](wb) {
        return {
            [MetricId.MetalTemp]: wb.readUint16BE() / 256, // 1°C every 256
        }
    },
    [CharAddr.WaterLevels](wb) {
        return {
            [MetricId.WaterLevel]: wb.readUint16BE() / 256 / 50, // 0-50mm
        }
    },
}

export default function parseCharUpdate(
    char: CharAddr,
    encodedWireBytes: string
): Partial<Record<MetricId, number>> {
    return (fns[char] || fallbackFn)(Buffer.from(encodedWireBytes, 'base64'))
}
