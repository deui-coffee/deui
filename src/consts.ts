import { Metric, MetricId } from './features/metric/types'

interface Metrics {
    [MetricId.FlowRate]: Metric
    [MetricId.MetalTemp]: Metric
    [MetricId.Pressure]: Metric
    [MetricId.ShotTime]: Metric
    [MetricId.WaterLevel]: Metric
    [MetricId.WaterTankCapacity]: Metric
    [MetricId.Weight]: Metric
}

export const metrics: Metrics = {
    [MetricId.FlowRate]: {
        label: 'Flow rate',
        unit: 'ml/s',
    },
    [MetricId.MetalTemp]: {
        label: 'Metal temp.',
        unit: '°C',
    },
    [MetricId.Pressure]: {
        label: 'Pressure',
        unit: 'bar',
    },
    [MetricId.ShotTime]: {
        label: 'Shot time',
        unit: 's',
    },
    [MetricId.WaterLevel]: {
        label: 'Water level',
        unit: 'ml',
    },
    [MetricId.WaterTankCapacity]: {
        label: 'Water tank capacity',
        unit: 'ml',
    },
    [MetricId.Weight]: {
        label: 'Weight',
        unit: 'g',
    },
}
