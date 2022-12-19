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
    WaterCapacity = 'waterCapacity',
}

export type Machine = Partial<
    { [Property.MajorState]: MajorState; [Property.MinorState]: MinorState } & Omit<
        Record<Property, number>,
        typeof Property.MinorState | typeof Property.MajorState | typeof Property.WaterCapacity
    >
> & {
    [Property.WaterCapacity]: number
}
