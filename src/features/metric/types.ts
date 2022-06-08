export enum MetricId {
    MetalTemp = 'metalTemp',
    Pressure = 'pressure',
    FlowRate = 'flowRate',
    ShotTime = 'shotTime',
    Weight = 'weight',
    WaterLevel = 'waterLevel',
    WaterTankCapacity = 'waterTankCapacity',
}

export type MetricValue = undefined | number

export interface Metric {
    unit: string
    label: string
}

export interface MetricState {
    items: {
        [metric: string]: MetricValue
    }
}
