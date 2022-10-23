import { MetricId } from '$/features/metric/types'
import { Buffer } from 'buffer'

type Fns = Record<MetricId, (wireBytes: Buffer) => number>

const fns: Fns = {
    [MetricId.MetalTemp](wb) {
        // 1°C every 256
        return wb.readUint16BE() / 256
    },
    [MetricId.Pressure]() {
        return 0
    },
    [MetricId.FlowRate]() {
        return 0
    },
    [MetricId.ShotTime]() {
        return 0
    },
    [MetricId.Weight]() {
        return 0
    },
    [MetricId.WaterLevel](wb) {
        // 0-47mm
        return wb.readUint16BE() / 256 / 47
    },
    [MetricId.WaterTankCapacity]() {
        return 1500
    },
}

export default function parseMetricData(metricId: MetricId, encodedWireBytes: string): number {
    return fns[metricId](Buffer.from(encodedWireBytes, 'base64'))
}
