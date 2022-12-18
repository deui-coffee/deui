import { MetricId } from '$/types'

type Metrics = Record<
    MetricId,
    {
        label: string
        unit?: string
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
