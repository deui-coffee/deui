import SettingsView from '$/components/NarrowView/SettingsView'
import MetricsView from '$/components/NarrowView/MetricsView'
import ProfilesView from '$/components/NarrowView/ProfilesView'
import { SettingsIcon } from '$/icons'
import { MetricsIcon } from '$/icons'
import { ProfilesIcon } from '$/icons'
import { z } from 'zod'
import rawProfiles from './generated/profiles.json'

export enum CharAddr {
    Versions /*       */ = '0000a001-0000-1000-8000-00805f9b34fb', // A R    Versions See T_Versions
    RequestedState /* */ = '0000a002-0000-1000-8000-00805f9b34fb', // B RW   RequestedState See T_RequestedState
    SetTime /*        */ = '0000a003-0000-1000-8000-00805f9b34fb', // C RW   SetTime Set current time
    ShotDirectory /*  */ = '0000a004-0000-1000-8000-00805f9b34fb', // D R    ShotDirectory View shot directory
    ReadFromMMR /*    */ = '0000a005-0000-1000-8000-00805f9b34fb', // E RW   ReadFromMMR Read bytes from data mapped into the memory mapped region.
    WriteToMMR /*     */ = '0000a006-0000-1000-8000-00805f9b34fb', // F W    WriteToMMR Write bytes to memory mapped region
    ShotMapRequest /* */ = '0000a007-0000-1000-8000-00805f9b34fb', // G W    ShotMapRequest Map a shot so that it may be read/written
    DeleteShotRange /**/ = '0000a008-0000-1000-8000-00805f9b34fb', // H W    DeleteShotRange Delete l shots in the range given
    FWMapRequest /*   */ = '0000a009-0000-1000-8000-00805f9b34fb', // I W    FWMapRequest Map a firmware image into MMR. Cannot be done with the boot image
    Temperatures /*   */ = '0000a00a-0000-1000-8000-00805f9b34fb', // J R    Temperatures See T_Temperatures
    ShotSettings /*   */ = '0000a00b-0000-1000-8000-00805f9b34fb', // K RW   ShotSettings See T_ShotSettings
    Deprecated /*     */ = '0000a00c-0000-1000-8000-00805f9b34fb', // L RW   Deprecated Was T_ShotDesc. Now deprecated.
    ShotSample /*     */ = '0000a00d-0000-1000-8000-00805f9b34fb', // M R    ShotSample Use to monitor a running shot. See T_ShotSample
    StateInfo /*      */ = '0000a00e-0000-1000-8000-00805f9b34fb', // N R    StateInfo The current state of the DE1
    HeaderWrite /*    */ = '0000a00f-0000-1000-8000-00805f9b34fb', // O RW   HeaderWrite Use this to change a header in the current shot description
    FrameWrite /*     */ = '0000a010-0000-1000-8000-00805f9b34fb', // P RW   FrameWrite Use this to change a single frame in the current shot description
    WaterLevels /*    */ = '0000a011-0000-1000-8000-00805f9b34fb', // Q RW   WaterLevels Use this to adjust and read water level settings
    Calibration /*    */ = '0000a012-0000-1000-8000-00805f9b34fb', // R RW   Calibration Use this to adjust and read calibration
}

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

export enum FrameFlag {
    CtrlF = 0x01, // Are we in Pressure or Flow priority mode?
    DoCompare = 0x02, // Do a compare, early exit current frame if compare true
    DC_GT = 0x04, // If we are doing a compare, then 0 = less than, 1 = greater than
    DC_CompF = 0x08, // Compare Pressure or Flow?
    TMixTemp = 0x10, // Disable shower head temperature compensation. Target Mix Temp instead.
    Interpolate = 0x20, // Hard jump to target value, or ramp?
    IgnoreLimit = 0x40, // Ignore minimum pressure and max flow settings

    DontInterpolate = 0, // Don't interpolate, just go to or hold target value
    CtrlP = 0,
    DC_CompP = 0,
    DC_LT = 0,
    TBasketTemp = 0,
}

export interface Frame {
    // U8P0   FrameToWrite
    FrameToWrite: number
}

export interface ShotFrame extends Frame {
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

export interface ShotExtensionFrame extends Frame {
    // U8P4
    MaxFlowOrPressure: number
    // U8P4
    MaxFoPRange: number
}

export interface ShotTailFrame extends Frame {
    // U10P0
    MaxTotalVolume: number
}

export interface Shot {
    header: ShotHeader
    frames: ShotFrame[]
}

export const ProfileManifest = z.object({
    id: z.string(),
    name: z.string(),
    visible: z.boolean().optional(),
})

export type ProfileManifest = z.infer<typeof ProfileManifest>

export enum ProfilePump {
    Flow = 'flow',
    Pressure = 'pressure',
}

export enum ProfileStepSensor {
    Coffee = 'coffee',
    Water = 'water',
}

export enum ProfileStepTransition {
    Fast = 'fast',
    Smooth = 'smooth',
}

export enum ProfileExitType {
    Flow = 'flow',
    Pressure = 'pressure',
}

export enum ProfileExitCondition {
    Over = 'over',
    Under = 'under',
}

export const ProfileStep = z.object({
    name: z.string(),
    temperature: z.number(),
    sensor: z.literal(ProfileStepSensor.Coffee).or(z.literal(ProfileStepSensor.Water)),
    pump: z.literal(ProfilePump.Flow).or(z.literal(ProfilePump.Pressure)),
    transition: z.literal(ProfileStepTransition.Fast).or(z.literal(ProfileStepTransition.Smooth)),
    pressure: z.number().optional(),
    flow: z.number().optional(),
    seconds: z.number(),
    volume: z.number().gte(0),
    weight: z.number(),
    exit: z
        .object({
            type: z.literal(ProfileExitType.Pressure).or(z.literal(ProfileExitType.Flow)),
            condition: z
                .literal(ProfileExitCondition.Over)
                .or(z.literal(ProfileExitCondition.Under)),
            value: z.number(),
        })
        .optional(),
    limiter: z
        .object({
            value: z.number(),
            range: z.number(),
        })
        .optional(),
})

export type ProfileStep = z.infer<typeof ProfileStep>

export enum ProfileType {
    Flow = 'flow',
    Pressure = 'pressure',
    Advanced = 'advanced',
}

export enum BeverageType {
    Espresso = 'espresso',
    PourOver = 'pourover',
    Cleaning = 'cleaning',
    Tea = 'tea',
    TeaPortafilter = 'tea_portafilter',
    Manual = 'manual',
    Calibrate = 'calibrate',
    Filter = 'filter',
}

export const Profile = z.object({
    id: z.string(),
    author: z.string(),
    beverage_type: z
        .literal(BeverageType.Espresso)
        .or(z.literal(BeverageType.PourOver))
        .or(z.literal(BeverageType.Cleaning))
        .or(z.literal(BeverageType.Tea))
        .or(z.literal(BeverageType.TeaPortafilter))
        .or(z.literal(BeverageType.Manual))
        .or(z.literal(BeverageType.Calibrate))
        .or(z.literal(BeverageType.Filter)),
    hidden: z.boolean(),
    lang: z.string(),
    notes: z.string(),
    tank_temperature: z.number(),
    target_volume_count_start: z.number(),
    target_volume: z.number(),
    target_weight: z.number(),
    type: z
        .literal(ProfileType.Flow)
        .or(z.literal(ProfileType.Pressure))
        .or(z.literal(ProfileType.Advanced)),
    version: z.number(),
    steps: z.array(ProfileStep),
})

export type Profile = z.infer<typeof Profile>

export const RawProfile = Profile.omit({ id: true })

export type RawProfile = z.infer<typeof RawProfile>

export function isRawProfile(payload: unknown): payload is RawProfile {
    return RawProfile.safeParse(payload).success
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
    MajorState = 1,
    MinorState,
    WaterLevel,
    WaterCapacity,
    WaterHeater,
    SteamHeater,
    GroupHeater,
    ColdWater,
    TargetWaterHeater,
    TargetSteamHeater,
    TargetGroupHeater,
    TargetColdWater,
    ShotSampleTime,
    ShotGroupPressure,
    ShotGroupFlow,
    ShotMixTemp,
    ShotHeadTemp,
    ShotSetMixTemp,
    ShotSetHeadTemp,
    ShotSetGroupPressure,
    ShotSetGroupFlow,
    ShotFrameNumber,
    ShotSteamTemp,
    SteamSettings,
    TargetSteamTemp,
    TargetSteamLength,
    TargetHotWaterTemp,
    TargetHotWaterVol,
    TargetHotWaterLength,
    TargetEspressoVol,
    TargetGroupTemp,
    EspressoTime,
    SteamTime,
    WaterTime,
    FlushTime,
    RecentEspressoMaxFlow,
    RecentEspressoMaxPressure,
}

export const RemoteProfile = z.object({
    id: z.string().or(z.undefined()),
    ready: z.boolean(),
})

export type RemoteProfile = z.infer<typeof RemoteProfile>

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
    deviceReady: z.boolean(),
    profile: RemoteProfile,
})

export type RemoteState = z.infer<typeof RemoteState>

export type Properties = Partial<Record<Prop, number>>

export enum MsgType {
    State = 'state',
    Characteristics = 'characteristics',
}

export const StateMessage = z.object({
    type: z.literal(MsgType.State),
    payload: RemoteState,
})

export type StateMessage = z.infer<typeof StateMessage>

export function isStateMessage(msg: unknown): msg is StateMessage {
    return StateMessage.safeParse(msg).success
}

export const CharMessage = z.object({
    type: z.literal(MsgType.Characteristics),
    payload: z
        .object({
            [CharAddr.Versions]: z.string(),
            [CharAddr.RequestedState]: z.string(),
            [CharAddr.SetTime]: z.string(),
            [CharAddr.ShotDirectory]: z.string(),
            [CharAddr.ReadFromMMR]: z.string(),
            [CharAddr.WriteToMMR]: z.string(),
            [CharAddr.ShotMapRequest]: z.string(),
            [CharAddr.DeleteShotRange]: z.string(),
            [CharAddr.FWMapRequest]: z.string(),
            [CharAddr.Temperatures]: z.string(),
            [CharAddr.ShotSettings]: z.string(),
            [CharAddr.Deprecated]: z.string(),
            [CharAddr.ShotSample]: z.string(),
            [CharAddr.StateInfo]: z.string(),
            [CharAddr.HeaderWrite]: z.string(),
            [CharAddr.FrameWrite]: z.string(),
            [CharAddr.WaterLevels]: z.string(),
            [CharAddr.Calibration]: z.string(),
        })
        .partial(),
})

export type CharMessage = z.infer<typeof CharMessage>

export function isCharMessage(msg: unknown): msg is CharMessage {
    return CharMessage.safeParse(msg).success
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
    Server = 'Server',
    Espresso = 'Espresso',
    Steam = 'Steam',
    Flush = 'Flush',
    Water = 'Water',
}

export enum MajorState {
    Unknown /*    */ = -1,
    Sleep /*         0x0 Everything is off. */,
    GoingToSleep /*  0x1 */,
    Idle /*          0x2 Heaters are controlled, tank water will be heated if required. */,
    Busy /*          0x3 Firmware is doing something you can't interrupt (eg. cooling down water heater after a shot, calibrating sensors on startup). */,
    Espresso /*      0x4 Making espresso. */,
    Steam /*         0x5 Making steam. */,
    HotWater /*      0x6 Making hot water. */,
    ShortCal /*      0x7 Running a short calibration. */,
    SelfTest /*      0x8 Checking as much as possible within the firmware. Probably only used during manufacture or repair. */,
    LongCal /*       0x9 Long and involved calibration, possibly involving user interaction. (See substates below, for cases like that). */,
    Descale /*       0xA Descale the whole bang-tooty. */,
    FatalError /*    0xB Something has gone horribly wrong. */,
    Init /*          0xC Machine has not been run yet. */,
    NoRequest /*     0xD State for T_RequestedState. Means nothing is specifically requested. */,
    SkipToNext /*    0xE In Espresso, skip to next frame. Others, go to Idle if possible. */,
    HotWaterRinse /* 0xF Produce hot water at whatever temperature is available. */,
    SteamRinse /*    0x10 Produce a blast of steam. */,
    Refill /*        0x11 Attempting, or needs, a refill. */,
    Clean /*         0x12 Clean group head. */,
    InBootLoader /*  0x13 The main firmware has not run for some reason. Bootloader is active. */,
    AirPurge /*      0x14 Air purge. */,
    ScheduledIdle /* 0x15 Scheduled wake up idle state. */,
}

export enum MinorState {
    NoState /*                0 State is not relevant */,
    HeatWaterTank /*          1 Cold water is not hot enough. Heating hot water tank. */,
    HeatWaterHeater /*        2 Warm up hot water heater for shot. */,
    StabilizeMixTemp /*       3 Stabilize mix temp and get entire water path up to temperature. */,
    PreInfuse /*              4 Espresso only. Hot Water and Steam will skip this state. */,
    Pour /*                   5 Not used in Steam */,
    Flush /*                  6 Espresso only, atm */,
    Steaming /*               7 Steam only */,
    DescaleInit /*            8 Starting descale */,
    DescaleFillGroup /*       9 get some descaling solution into the group and let it sit */,
    DescaleReturn /*         10 descaling internals */,
    DescaleGroup /*          11 descaling group */,
    DescaleSteam /*          12 descaling steam */,
    CleanInit /*             13 Starting clean */,
    CleanFillGroup /*        14 Fill the group */,
    CleanSoak /*             15 Wait for 60 seconds so we soak the group head */,
    CleanGroup /*            16 Flush through group */,
    PausedRefill /*          17 Have we given up on a refill */,
    PausedSteam /*           18 Are we paused in steam? */,
    UserNotPresent /*        19 Tell the tablet we think the user is not present */,
    SteamPuff /*             20 Steaming in puff mode */,
    Error_NaN = 200 /*          Something died with a NaN */,
    Error_Inf = 201 /*          Something died with an Inf */,
    Error_Generic = 202 /*      An error for which we have no more specific description */,
    Error_ACC = 203 /*          ACC not responding, unlocked, or incorrectly programmed */,
    Error_TSensor = 204 /*      We are getting an error that is probably a broken temperature sensor */,
    Error_PSensor = 205 /*      Pressure sensor error */,
    Error_WLevel = 206 /*       Water level sensor error */,
    Error_DIP = 207 /*          DIP switches told us to wait in the error state. */,
    Error_Assertion = 208 /*    Assertion failed */,
    Error_Unsafe = 209 /*       Unsafe value assigned to variable */,
    Error_InvalidParm = 210 /*  Invalid parameter passed to function */,
    Error_Flash = 211 /*        Error accessing external flash */,
    Error_OOM = 212 /*          Could not allocate memory */,
    Error_Deadline = 213 /*     Realtime deadline missed */,
    Error_HiCurrent = 214 /*    Measured a current that is out of bounds. */,
    Error_LoCurrent = 215 /*    Not enough current flowing, despite something being turned on. */,
    Error_BootFill = 216 /*     Could not get up to pressure during boot pressure test, possibly because no water */,
}

export const Layer = {
    Drawer: 'drawers',
}

export enum ServerErrorCode {
    NotPoweredOn = 1,
    AlreadyScanning,
    AlreadyConnecting,
    AlreadyConnected,
    NotConnected,
    UnknownCharacteristic,
    AlreadyWritingShot,
}

export const profiles = (rawProfiles as ProfileManifest[]).sort(({ id: a }, { id: b }) =>
    a.localeCompare(b)
)

export enum ShotExecMethod {
    Header = 'exec_writeShotHeader',
    Frame = 'exec_writeShotFrame',
    Tail = 'exec_writeShotTail',
    ShotSettings = 'exec_writeShotSettings',
    ShotBeginProfileWrite = 'exec_beginProfileWrite',
    ShotEndProfileWrite = 'exec_endProfileWrite',
}

export interface ShotExecCommand {
    method: ShotExecMethod
    params: Buffer
}

export enum SteamSetting {
    // Start the steam quickly and at higher pressure
    FastStart = 0x80,
    // Start the steam slowly and at lower pressure (ie. No Bit set)
    SlowStart = 0x00,
    // Run the steam at higher pressure
    HighPower = 0x40,
    // Run the steam at lower pressure
    LowPower = 0x00,
}

export interface ShotSettings {
    // Defines the steam shot
    SteamSettings: SteamSetting
    // U8P0 Valid range is 140 - 160
    TargetSteamTemp: number
    // U8P0 Length in seconds of steam
    TargetSteamLength: number
    // U8P0 Temperature of the mixed hot water
    TargetHotWaterTemp: number
    // U8P0 How much water we'll need for hot water (so we know if we have enough)
    TargetHotWaterVol: number
    // U8P0 (DE1 only) Length of time for a shot (water vol is ignored)
    TargetHotWaterLength: number
    // U8P0 So we know if we have enough water
    TargetEspressoVol: number
    // U16P8 So we know what to set the group to
    TargetGroupTemp: number
}

export enum ConnectionPhase {
    Irrelevant = 1000,
    WaitingToReconnect,
    Opening,
    Scanning,
    ConnectingAdapters,
    SettingUp,
    BluetoothOff,
    NoBluetooth,
}

export enum Period {
    Am = 'am',
    Pm = 'pm',
}

export interface Time {
    period: Period
    hour: string
    minute: string
}
