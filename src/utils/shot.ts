import { fromF817, toF817 } from '$/server/utils'
import {
    FrameFlag,
    Profile,
    ProfileExitCondition,
    ProfileExitType,
    ProfilePump,
    ProfileStep,
    ProfileStepSensor,
    ProfileStepTransition,
    ShotExtensionFrame,
    ShotFrame,
    ShotHeader,
    ShotTailFrame,
} from '$/types'

const HeaderV = 1

const NumberOfPreinfuseFrames = 1

const MinimumPressure = 0

const MaximumFlow = 6

export function toShotHeader({ steps }: Profile): ShotHeader {
    return {
        HeaderV,
        NumberOfFrames: steps.length,
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
        header.MinimumPressure,
        0x0 | (0.5 + header.MaximumFlow * 0x10),
    ])
}

export function decodeShotHeader(buf: Buffer): ShotHeader {
    return {
        HeaderV: buf.readUint8(0),
        NumberOfFrames: buf.readUint8(1),
        NumberOfPreinfuseFrames: buf.readUint8(2),
        MinimumPressure: buf.readUint8(3),
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
        flag |= FrameFlag.DC_CompF
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
        frame.SetVal,
        frame.Temp,
        toF817(frame.FrameLen),
        (frame.TriggerVal >> 8) & 0x3,
        frame.TriggerVal & 0xff,
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
    step: ProfileStep
): ShotExtensionFrame | null {
    if (!step.limiter) {
        return null
    }

    return {
        FrameToWrite: index + 32,
        MaxFlowOrPressure: step.limiter.value,
        MaxFoPRange: step.limiter.range,
    }
}

export function encodeShotExtensionFrame(frame: ShotExtensionFrame): Buffer {
    return Buffer.from([
        frame.FrameToWrite,
        0x0 | (frame.MaxFlowOrPressure * 0x10),
        0x0 | (frame.MaxFoPRange * 0x10),
        0,
        0,
        0,
        0,
    ])
}

export function decodedShotExtensionFrame(buf: Buffer): ShotExtensionFrame {
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
    ])
}

export function decodeShotTailFrame(buf: Buffer): ShotTailFrame {
    return {
        FrameToWrite: buf.readUint8(0),
        MaxTotalVolume: buf.readUint16BE(1) & 0x3ff,
    }
}
