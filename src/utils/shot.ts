import { Buffer } from 'buffer'
import { fromF817, toF817 } from '$/server/utils'
import {
    CharAddr,
    FrameFlag,
    Profile,
    ProfileExitCondition,
    ProfileExitType,
    ProfilePump,
    ProfileStep,
    ProfileStepSensor,
    ProfileStepTransition,
    ShotExecMethod,
    ShotExtensionFrame,
    ShotFrame,
    ShotHeader,
    ShotSettings,
    ShotTailFrame,
} from '$/types'

const HeaderV = 1

const NumberOfPreinfuseFrames = 1

const MinimumPressure = 0

const MaximumFlow = 6

export function toShotHeader(numberOfFrames: number): ShotHeader {
    return {
        HeaderV,
        NumberOfFrames: numberOfFrames,
        NumberOfPreinfuseFrames,
        MinimumPressure,
        MaximumFlow,
    }
}

export function encodeShotHeader(header: ShotHeader): Buffer {
    return Buffer.from([
        header.HeaderV,
        header.NumberOfFrames,
        header.NumberOfPreinfuseFrames,
        0x0 | (0.5 + header.MinimumPressure * 0x10),
        0x0 | (0.5 + header.MaximumFlow * 0x10),
    ])
}

export function decodeShotHeader(buf: Buffer): ShotHeader {
    return {
        HeaderV: buf.readUint8(0),
        NumberOfFrames: buf.readUint8(1),
        NumberOfPreinfuseFrames: buf.readUint8(2),
        MinimumPressure: buf.readUint8(3) / 0x10,
        MaximumFlow: buf.readUint8(4) / 0x10,
    }
}

export function toShotFrameAt(index: number, step: ProfileStep): ShotFrame {
    let flag = FrameFlag.IgnoreLimit

    if (step.pump === ProfilePump.Flow) {
        flag |= FrameFlag.CtrlF
    }

    if (step.sensor === ProfileStepSensor.Water) {
        flag |= FrameFlag.TMixTemp
    }

    if (step.transition === ProfileStepTransition.Smooth) {
        flag |= FrameFlag.Interpolate
    }

    const exitData = step.exit

    if (exitData) {
        flag |= FrameFlag.DoCompare
    }

    if (exitData?.condition === ProfileExitCondition.Over) {
        flag |= FrameFlag.DC_GT
    }

    if (exitData?.type === ProfileExitType.Flow) {
        flag |= FrameFlag.CtrlF
    }

    return {
        FrameToWrite: index,
        Flag: flag,
        SetVal: 0,
        Temp: step.temperature,
        FrameLen: step.seconds,
        TriggerVal: exitData?.value || 0,
        MaxVol: index ? 0 : step.volume,
    }
}

export function encodeShotFrame(frame: ShotFrame): Buffer {
    return Buffer.from([
        frame.FrameToWrite,
        frame.Flag,
        0x0 | (0.5 + frame.SetVal * 0x10),
        0x0 | (0.5 + frame.Temp * 2),
        toF817(frame.FrameLen),
        0x0 | (0.5 + frame.TriggerVal * 0x10),
        (frame.MaxVol >> 8) & 0x3,
        frame.MaxVol & 0xff,
    ])
}

export function decodeShotFrame(buf: Buffer): ShotFrame {
    return {
        FrameToWrite: buf.readUint8(0),
        Flag: buf.readUint8(1),
        SetVal: buf.readUint8(2) / 0x10,
        Temp: buf.readUint8(3) / 2,
        FrameLen: fromF817(buf.readUint8(4)),
        TriggerVal: buf.readUint8(5) / 0x10,
        MaxVol: buf.readUint16BE(6) & 0x3ff,
    }
}

export function toShotExtensionFrameAt(
    index: number,
    { limiter }: Pick<ProfileStep, 'limiter'>
): ShotExtensionFrame | null {
    if (!limiter) {
        return null
    }

    return {
        FrameToWrite: index + 32,
        MaxFlowOrPressure: limiter.value,
        MaxFoPRange: limiter.range,
    }
}

export function encodeShotExtensionFrame(frame: ShotExtensionFrame): Buffer {
    return Buffer.from([
        frame.FrameToWrite,
        0x0 | (0.5 + frame.MaxFlowOrPressure * 0x10),
        0x0 | (0.5 + frame.MaxFoPRange * 0x10),
        0,
        0,
        0,
        0,
        0,
    ])
}

export function decodeShotExtensionFrame(buf: Buffer): ShotExtensionFrame {
    return {
        FrameToWrite: buf.readUint8(0),
        MaxFlowOrPressure: buf.readUint8(1) / 0x10,
        MaxFoPRange: buf.readUint8(2) / 0x10,
    }
}

export function toShotTailFrameAt(index: number, maxTotalVolume: number): ShotTailFrame {
    return {
        FrameToWrite: index,
        MaxTotalVolume: maxTotalVolume,
    }
}

export function encodeShotTailFrame(frame: ShotTailFrame): Buffer {
    return Buffer.from([
        frame.FrameToWrite,
        (frame.MaxTotalVolume >> 8) & 0x3,
        frame.MaxTotalVolume & 0xff,
        0,
        0,
        0,
        0,
        0,
    ])
}

export function decodeShotTailFrame(buf: Buffer): ShotTailFrame {
    return {
        FrameToWrite: buf.readUint8(0),
        MaxTotalVolume: buf.readUint16BE(1) & 0x3ff,
    }
}

export function toEncodedShot(profile: Profile) {
    const bufs: { method: ShotExecMethod; payload: Buffer }[] = [
        {
            method: ShotExecMethod.Header,
            payload: encodeShotHeader(toShotHeader(profile.steps.length)),
        },
    ]

    profile.steps.forEach((step, index) => {
        bufs.push({
            method: ShotExecMethod.Frame,
            payload: encodeShotFrame(toShotFrameAt(index, step)),
        })
    })

    profile.steps.forEach((step, index) => {
        const extensionFrame = toShotExtensionFrameAt(index, step)

        if (extensionFrame) {
            bufs.push({
                method: ShotExecMethod.Frame,
                payload: encodeShotExtensionFrame(extensionFrame),
            })
        }
    })

    bufs.push({
        method: ShotExecMethod.Frame,
        payload: encodeShotTailFrame(toShotTailFrameAt(profile.steps.length, 0)),
    })

    return bufs
}

export function toEncodedShotSettings(shotSettings: ShotSettings): Buffer {
    const targetGroupTemp = 0x0 | (shotSettings.TargetGroupTemp * 0x100)

    return Buffer.from([
        shotSettings.SteamSettings,
        shotSettings.TargetSteamTemp,
        shotSettings.TargetSteamLength,
        shotSettings.TargetHotWaterTemp,
        shotSettings.TargetHotWaterVol,
        shotSettings.TargetHotWaterLength,
        shotSettings.TargetEspressoVol,
        targetGroupTemp >> 8,
        targetGroupTemp & 0xff,
    ])
}