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
    WaterHeater = 'waterHeater',
    SteamHeater = 'steamHeater',
    GroupHeater = 'groupHeater',
    ColdWater = 'coldWater',
    TargetWaterHeater = 'targetWaterHeater',
    TargetSteamHeater = 'targetSteamHeater',
    TargetGroupHeater = 'targetGroupHeater',
    TargetColdWater = 'targetColdWater',
    MajorState = 'minor',
    MinorState = 'major',
    WaterCapacity = 'waterCapacity',
    WaterLevel = 'waterLevel',
    ShotSampleTime = 'shotSampleTime',
    ShotGroupPressure = 'shotGroupPressure',
    ShotGroupFlow = 'shotGroupFlow',
    ShotMixTemp = 'shotMixTemp',
    ShotHeadTemp = 'shotHeadTemp',
    ShotSetMixTemp = 'shotSetMixTemp',
    ShotSetHeadTemp = 'shotSetHeadTemp',
    ShotSetGroupPressure = 'shotSetGroupPressure',
    ShotSetGroupFlow = 'shotSetGroupFlow',
    ShotFrameNumber = 'shotFrameNumber',
    ShotSteamTemp = 'shotSteamTemp',
}

export type Machine = Partial<
    { [Property.MajorState]: MajorState; [Property.MinorState]: MinorState } & Omit<
        Record<Property, number>,
        typeof Property.MinorState | typeof Property.MajorState | typeof Property.WaterCapacity
    >
> & {
    [Property.WaterCapacity]: number
}
