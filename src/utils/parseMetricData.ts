import { MetricId } from '$/features/metric/types'
import { Buffer } from 'buffer'

export default function parseMetricData(
    metricId: MetricId,
    encodedWireBytes: string
): undefined | number {
    const wireBytes = Buffer.from(encodedWireBytes, 'base64')

    switch (metricId) {
        case MetricId.WaterLevel:
            return wireBytes.readUint16BE() / 256 / 45 // Values range from 0mm (empty) to 45mm (full).
        default:
            return undefined
    }
}
