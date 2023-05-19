import SettingsView from '$/components/NarrowView/SettingsView'
import MetricsView from '$/components/NarrowView/MetricsView'
import ProfilesView from '$/components/NarrowView/ProfilesView'
import SettingsIcon from '$/icons/SettingsIcon'
import MetricsIcon from '$/icons/MetricsIcon'
import ProfilesIcon from '$/icons/ProfilesIcon'
import { MajorState, MinorState } from './consts'
import { z } from 'zod'

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

export enum WebSocketState {
    Opening = 'opening',
    Open = 'open',
    Closed = 'closed',
}

enum AddressType {
    Public = 'public',
    Random = 'random',
    Unknown = 'unknown',
}

export const Peripheral = z.object({
    id: z.string(),
    address: z.string(),
    addressType: z
        .literal(AddressType.Public)
        .or(z.literal(AddressType.Random))
        .or(z.literal(AddressType.Unknown)),
    connectable: z.boolean().or(z.undefined()),
    rssi: z.number(),
    mtu: z.number().or(z.null()),
    advertisement: z.object({
        localName: z.string(),
    }),
})

export type Peripheral = z.infer<typeof Peripheral>

export enum BluetoothState {
    Unknown = 'unknown',
    Resetting = 'resetting',
    Unsupported = 'unsupported',
    Unauthorized = 'unauthorized',
    PoweredOff = 'poweredOff',
    PoweredOn = 'poweredOn',
}

export enum Prop {
    MajorState = 'mjs',
    MinorState = 'mns',
    WaterLevel = 'wl',
    WaterCapacity = 'wcap',
    WaterHeater = 'wh',
    SteamHeater = 'sh',
    GroupHeater = 'gh',
    ColdWater = 'cw',
    TargetWaterHeater = 'twh',
    TargetSteamHeater = 'tsh',
    TargetGroupHeater = 'tgh',
    TargetColdWater = 'tcw',

    // Not implemented.
    ShotGroupPressure = 'sgp',
    ShotGroupFlow = 'sgf',
    ShotSampleTime = 'sht',
    ShotSteamTemp = 'ShotSteamTemp',
}

export const RemoteState = z.object({
    bluetoothState: z
        .literal(BluetoothState.Unknown)
        .or(z.literal(BluetoothState.Resetting))
        .or(z.literal(BluetoothState.Unsupported))
        .or(z.literal(BluetoothState.Unauthorized))
        .or(z.literal(BluetoothState.PoweredOff))
        .or(z.literal(BluetoothState.PoweredOn)),
    scanning: z.boolean(),
    connecting: z.boolean(),
    discoveringCharacteristics: z.boolean(),
    device: Peripheral.or(z.undefined()),
})

export type RemoteState = z.infer<typeof RemoteState>

export const Properties = z.object({
    [Prop.MajorState]: z.number().optional().or(z.undefined()),
    [Prop.MinorState]: z.number().optional().or(z.undefined()),
    [Prop.WaterLevel]: z.number().optional().or(z.undefined()),
    [Prop.WaterCapacity]: z.number().optional().or(z.undefined()),
    [Prop.WaterHeater]: z.number().optional().or(z.undefined()),
    [Prop.SteamHeater]: z.number().optional().or(z.undefined()),
    [Prop.GroupHeater]: z.number().optional().or(z.undefined()),
    [Prop.ColdWater]: z.number().optional().or(z.undefined()),
    [Prop.TargetWaterHeater]: z.number().optional().or(z.undefined()),
    [Prop.TargetSteamHeater]: z.number().optional().or(z.undefined()),
    [Prop.TargetGroupHeater]: z.number().optional().or(z.undefined()),
    [Prop.TargetColdWater]: z.number().optional().or(z.undefined()),
    [Prop.ShotGroupPressure]: z.number().optional().or(z.undefined()),
    [Prop.ShotGroupFlow]: z.number().optional().or(z.undefined()),
    [Prop.ShotSampleTime]: z.number().optional().or(z.undefined()),
    [Prop.ShotSteamTemp]: z.number().optional().or(z.undefined()),
})

export type Properties = z.infer<typeof Properties>

export enum MsgType {
    State = 'state',
    Properties = 'properties',
}

export const StateMessage = z.object({
    type: z.literal('state'),
    payload: RemoteState,
})

export type StateMessage = z.infer<typeof StateMessage>

export function isStateMessage(msg: unknown): msg is StateMessage {
    return StateMessage.safeParse(msg).success
}

export const PropertiesMessage = z.object({
    type: z.literal('properties'),
    payload: Properties,
})

export type PropertiesMessage = z.infer<typeof PropertiesMessage>

export function isPropertiesMessage(msg: unknown): msg is PropertiesMessage {
    return PropertiesMessage.safeParse(msg).success
}

export enum ChunkType {
    WebSocketClose = 'ws:close',
    WebSocketOpen = 'ws:open',
    WebSocketError = 'ws:error',
    WebSocketMessage = 'ws:message',
}

export interface WsCloseChunk {
    type: ChunkType.WebSocketClose
    payload: CloseEvent
}

export interface WsErrorChunk {
    type: ChunkType.WebSocketError
    payload: Event
}

export interface WsMessageChunk {
    type: ChunkType.WebSocketMessage
    payload: unknown
}

export interface WsOpenChunk {
    type: ChunkType.WebSocketOpen
    payload: Event
}

export type Chunk = WsCloseChunk | WsErrorChunk | WsMessageChunk | WsOpenChunk

export enum MachineMode {
    Espresso = 'Espresso',
    Steam = 'Steam',
    Flush = 'Flush',
    Water = 'Water',
}
