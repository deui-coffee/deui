import SettingsView from '$/components/NarrowView/SettingsView'
import MetricsView from '$/components/NarrowView/MetricsView'
import ProfilesView from '$/components/NarrowView/ProfilesView'
import SettingsIcon from '$/icons/SettingsIcon'
import MetricsIcon from '$/icons/MetricsIcon'
import ProfilesIcon from '$/icons/ProfilesIcon'
import { MajorState, MinorState } from './consts'

export enum StorageKey {
    Theme = 'deui/theme',
    Profile = 'deui/profile',
    BackendUrl = 'deui/backendUrl',
    RecentMAC = 'deui/recentMAC',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export interface Flagged {
    flag: string
}

export enum MetricId {
    MetalTemp = 'metalTemp',
    Pressure = 'pressure',
    FlowRate = 'flowRate',
    ShotTime = 'shotTime',
    Weight = 'weight',
    WaterLevel = 'waterLevel',
    WaterTankCapacity = 'waterTankCapacity',
}

export enum ViewId {
    Settings = 'settings',
    Metrics = 'metrics',
    Profiles = 'profiles',
}

export interface ViewState {
    viewId: ViewId
    index: number
}

export interface View {
    id: ViewId
    component: typeof SettingsView | typeof MetricsView | typeof ProfilesView
    icon: typeof SettingsIcon | typeof MetricsIcon | typeof ProfilesIcon
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

export interface Profile {
    id: string
    name: string
}
