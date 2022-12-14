import { MetricId } from '$/types'

export interface CafeHubState {
    metrics: Record<MetricId, number>
    phase: Phase
    recentMAC: undefined | string
}

export enum Phase {
    Connected = 'connected',
    Connecting = 'connecting',
    Disconnected = 'disconnected',
    Disconnecting = 'disconnecting',
    Paired = 'paired',
    Pairing = 'pairing',
    Scanning = 'scanning',
    Unpaired = 'unpaired',
    Unscanned = 'unscanned',
}
