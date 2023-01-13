import { MajorState, MinorState } from '$/consts'

export interface CafeHubState {
    machine: Machine
    shot: Shot
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

export interface ShotHeader {
    // U8P0 HeaderV
    HeaderV: number
    // U8P0 NumberOfFrames
    NumberOfFrames: number
    // U8P0 NumberOfPreinfuseFrames
    NumberOfPreinfuseFrames: number
    // U8P4 MinimumPressure
    MinimumPressure: number
    // U8P4 MaximumFlow
    MaximumFlow: number
}

export interface ShotFrame {
    // U8P0   FrameToWrite
    FrameToWrite: number
    // U8P0   Flag
    Flag: number
    // U8P4   SetVal
    SetVal: number
    // U8P1   Temp
    Temp: number
    // F8_1_7 FrameLen ~ U8
    FrameLen: number
    // U8P4   TriggerVal
    TriggerVal: number
    // U10P0  MaxVol ~ U16
    MaxVol: number
}

export interface Shot {
    header: ShotHeader
    frames: ShotFrame[]
}
