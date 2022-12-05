import { MetricId } from '$/types'

export interface CafeHubState {
    metrics: Record<MetricId, number>
    phase: Phase
}

export enum Phase {
    Idle,
    Connecting,
    Connected,
    Scanning,
    Pairing,
    Paired,
    Unpaired,
}
