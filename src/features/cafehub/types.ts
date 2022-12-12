import { MetricId } from '$/types'

export interface CafeHubState {
    metrics: Record<MetricId, number>
    phase: Phase
}

export enum Phase {
    Disconnected,
    Connecting,
    Connected,
    Scanning,
    Unscanned,
    Pairing,
    Paired,
    Unpaired,
}
