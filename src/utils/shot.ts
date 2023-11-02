import { Buffer } from 'buffer'
import { fromF817, toF817 } from '../shared/utils'
import {
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
} from '../types'
import { toU10P0, toU8P1, toU8P4 } from '.'

export function toShotHeader(
    partial: Pick<ShotHeader, 'NumberOfFrames' | 'NumberOfPreinfuseFrames'>
): ShotHeader {
    return {
        HeaderV: 1,
        MinimumPressure: 0,
        MaximumFlow: 6,
        ...partial,
    }
}

export function encodeShotHeader(header: ShotHeader): Buffer {
    return Buffer.from([
        header.HeaderV,
        header.NumberOfFrames,
        header.NumberOfPreinfuseFrames,
        toU8P4(header.MinimumPressure),
        toU8P4(header.MaximumFlow),
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

    let SetVal = 0

    if (step.pump === ProfilePump.Flow) {
        flag |= FrameFlag.CtrlF

        if (typeof step.flow !== 'number') {
            throw new Error('Invalid flow')
        }

        SetVal = step.flow
    } else {
        if (typeof step.pressure !== 'number') {
            throw new Error('Invalid pressure')
        }

        SetVal = step.pressure
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
        flag |= FrameFlag.DC_CompF
    }

    return {
        FrameToWrite: index,
        Flag: flag,
        SetVal,
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
        toU8P4(frame.SetVal),
        toU8P1(frame.Temp),
        toF817(frame.FrameLen),
        toU8P4(frame.TriggerVal),
        ...toU10P0(frame.MaxVol),
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
        toU8P4(frame.MaxFlowOrPressure),
        toU8P4(frame.MaxFoPRange),
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
    return Buffer.from([frame.FrameToWrite, ...toU10P0(frame.MaxTotalVolume), 0, 0, 0, 0, 0])
}

export function decodeShotTailFrame(buf: Buffer): ShotTailFrame {
    return {
        FrameToWrite: buf.readUint8(0),
        MaxTotalVolume: buf.readUint16BE(1) & 0x3ff,
    }
}

export function toEncodedShot(profile: Profile) {
    /**
     * We may want to add a 2 second pause step, see
     * https://github.com/decentespresso/de1app/blob/main/de1plus/binary.tcl#L878-L893
     */
    const steps = [...profile.steps]

    const bufs: { method: ShotExecMethod; payload: Buffer }[] = [
        {
            method: ShotExecMethod.Header,
            payload: encodeShotHeader(
                toShotHeader({
                    NumberOfFrames: steps.length,
                    /**
                     * NumberOfPreinfuseFrames is driven by final_desired_shot_volume_advanced_count_start in the original
                     * profil logic, see
                     * https://github.com/decentespresso/de1app/blob/main/de1plus/binary.tcl#L984
                     *
                     * I'mma stick to 0 for the frames we have. Our future profiles have to name this property correctly.
                     */
                    NumberOfPreinfuseFrames: 0,
                })
            ),
        },
    ]

    steps.forEach((step, index) => {
        bufs.push({
            method: ShotExecMethod.Frame,
            payload: encodeShotFrame(toShotFrameAt(index, step)),
        })
    })

    steps.forEach((step, index) => {
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
        payload: encodeShotTailFrame(toShotTailFrameAt(steps.length, 0)),
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
