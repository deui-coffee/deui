import { MajorState, MinorState } from '$/consts'

export interface CafeHubState {
    machine: Machine
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

export enum Property {
    Temperature = 'temperature',
    WaterLevel = 'waterLevel',
    MajorState = 'minor',
    MinorState = 'major',
}

export type Machine = Partial<
    { minor: MajorState; major: MinorState } & Omit<Record<Property, number>, 'minor' | 'major'>
>
