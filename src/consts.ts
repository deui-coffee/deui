import { MetricId } from '$/types'

type Metrics = Record<
    MetricId,
    {
        label: string
        unit: string
    }
>

export const metrics: Metrics = {
    [MetricId.FlowRate]: {
        label: 'Flow rate',
        unit: 'ml/s',
    },
    [MetricId.MetalTemp]: {
        label: 'Metal temp.',
        unit: '°C',
    },
    [MetricId.Pressure]: {
        label: 'Pressure',
        unit: 'bar',
    },
    [MetricId.ShotTime]: {
        label: 'Shot time',
        unit: 's',
    },
    [MetricId.WaterLevel]: {
        label: 'Water level',
        unit: 'ml',
    },
    [MetricId.WaterTankCapacity]: {
        label: 'Water tank capacity',
        unit: 'ml',
    },
    [MetricId.Weight]: {
        label: 'Weight',
        unit: 'g',
    },
}

export enum MachineState {
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
