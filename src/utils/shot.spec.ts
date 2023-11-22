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
    ShotTailFrame,
} from '$/shared/types'
import {
    decodeShotExtensionFrame,
    decodeShotFrame,
    decodeShotHeader,
    decodeShotTailFrame,
    encodeShotExtensionFrame,
    encodeShotFrame,
    encodeShotHeader,
    encodeShotTailFrame,
    toEncodedShot,
    toShotExtensionFrameAt,
    toShotFrameAt,
    toShotHeader,
    toShotTailFrameAt,
} from './shot'
import * as ClassicItalianEspresso from '../../public/profiles/classic_italian_espresso.json'

describe('Shot utils', () => {
    describe('shot header', () => {
        const header = toShotHeader({
            NumberOfFrames: 7,
            NumberOfPreinfuseFrames: 1,
        })

        describe('toShotHeader', () => {
            it('turns a number of frames into a proper header', () => {
                expect(header).toMatchObject({
                    HeaderV: 1,
                    NumberOfFrames: 7,
                    NumberOfPreinfuseFrames: 1,
                    MinimumPressure: 0,
                    MaximumFlow: 6,
                })
            })
        })

        describe('encodeShotHeader', () => {
            it('converts a shot header into a buffer', () => {
                expect(encodeShotHeader(header).toString('hex')).toEqual('0107010060')
            })
        })

        describe('decodeShotHeader', () => {
            it('converts a buffer into a shot header', () => {
                expect(decodeShotHeader(Buffer.from([1, 7, 1, 0, 96]))).toMatchObject(header)
            })
        })
    })

    describe('shot frame', () => {
        const step: ProfileStep = {
            name: 'yet another frame',
            pressure: 8.4,
            pump: ProfilePump.Pressure,
            seconds: 9,
            sensor: ProfileStepSensor.Coffee,
            temperature: 92,
            transition: ProfileStepTransition.Fast,
            volume: 13,
            weight: 0,
        }

        const frame: ShotFrame = {
            FrameToWrite: 3,
            Flag: FrameFlag.IgnoreLimit,
            SetVal: 8.4,
            Temp: 92,
            FrameLen: 9,
            TriggerVal: 0,
            MaxVol: 0,
        }

        describe('toShotFrameAt', () => {
            it('turns a profile step into a shot frame', () => {
                expect(toShotFrameAt(3, step)).toMatchObject(frame)

                expect(toShotFrameAt(0, step)).toMatchObject({
                    ...frame,
                    FrameToWrite: 0,
                    MaxVol: 13,
                })

                expect(
                    toShotFrameAt(3, { ...step, flow: 7, pump: ProfilePump.Flow })
                ).toMatchObject({
                    ...frame,
                    SetVal: 7,
                    Flag: FrameFlag.IgnoreLimit | FrameFlag.CtrlF,
                })

                expect(
                    toShotFrameAt(3, { ...step, sensor: ProfileStepSensor.Water })
                ).toMatchObject({ ...frame, Flag: FrameFlag.IgnoreLimit | FrameFlag.TMixTemp })

                expect(
                    toShotFrameAt(3, { ...step, transition: ProfileStepTransition.Smooth })
                ).toMatchObject({ ...frame, Flag: FrameFlag.IgnoreLimit | FrameFlag.Interpolate })

                expect(
                    toShotFrameAt(3, {
                        ...step,
                        exit: {
                            condition: ProfileExitCondition.Under,
                            type: ProfileExitType.Pressure,
                            value: 7,
                        },
                    })
                ).toMatchObject({
                    ...frame,
                    TriggerVal: 7,
                    Flag: FrameFlag.IgnoreLimit | FrameFlag.DoCompare,
                })

                expect(
                    toShotFrameAt(3, {
                        ...step,
                        exit: {
                            condition: ProfileExitCondition.Over,
                            type: ProfileExitType.Pressure,
                            value: 7,
                        },
                    })
                ).toMatchObject({
                    ...frame,
                    TriggerVal: 7,
                    Flag: FrameFlag.IgnoreLimit | FrameFlag.DoCompare | FrameFlag.DC_GT,
                })

                expect(
                    toShotFrameAt(3, {
                        ...step,
                        exit: {
                            condition: ProfileExitCondition.Under,
                            type: ProfileExitType.Flow,
                            value: 7,
                        },
                    })
                ).toMatchObject({
                    ...frame,
                    TriggerVal: 7,
                    Flag: FrameFlag.IgnoreLimit | FrameFlag.DoCompare | FrameFlag.DC_CompF,
                })
            })
        })

        describe('encodeShotFrame', () => {
            it('turns a shot frame into a buffer', () => {
                expect(encodeShotFrame(frame).toString('hex')).toEqual('034086b85a000000')
            })
        })

        describe('decodeShotFrame', () => {
            it('turns a buffer into a shot frame', () => {
                expect(
                    decodeShotFrame(Buffer.from([0x03, 0x40, 0x86, 0xb8, 0x5a, 0x00, 0x00, 0x00]))
                ).toMatchObject({ ...frame, SetVal: 8.375 })

                expect(
                    decodeShotFrame(Buffer.from([0x03, 0x40, 0x86, 0xb8, 0x5a, 0x10, 0xff, 0xff]))
                ).toMatchObject({ ...frame, MaxVol: 0x3ff, SetVal: 8.375, TriggerVal: 1 })
            })
        })
    })

    describe('shot extension frame', () => {
        const index = 1

        const frame: ShotExtensionFrame = {
            FrameToWrite: 33, // 32 + index
            MaxFlowOrPressure: 2,
            MaxFoPRange: 4,
        }

        const buffer = Buffer.from([0x21, 0x20, 0x40, 0, 0, 0, 0, 0])

        describe('toShotExtensionFrameAt', () => {
            it('turns step without `limiter` into null', () => {
                expect(toShotExtensionFrameAt(index, {})).toBe(null)
            })

            it('turns limited step into a shot extension frame', () => {
                expect(
                    toShotExtensionFrameAt(index, { limiter: { value: 2, range: 4 } })
                ).toMatchObject(frame)
            })
        })

        describe('encodeShotExtensionFrame', () => {
            it('turns a shot extension frame into a buffer', () => {
                expect(encodeShotExtensionFrame(frame).toString('hex')).toEqual(
                    buffer.toString('hex')
                )
            })
        })

        describe('decodeShotExtensionFrame', () => {
            it('turns a buffer into a shot extension frame', () => {
                expect(decodeShotExtensionFrame(buffer)).toMatchObject(frame)
            })
        })
    })

    describe('shot tail frame', () => {
        const index = 20

        const frame: ShotTailFrame = {
            FrameToWrite: index,
            MaxTotalVolume: 1000,
        }

        const buffer = Buffer.from([0x14, 0x03, 0xe8, 0, 0, 0, 0, 0])

        describe('toShotTailFrameAt', () => {
            it('turns max total volume into a shot tail frame', () => {
                expect(toShotTailFrameAt(index, 1000)).toMatchObject(frame)
            })
        })

        describe('encodeShotTailFrame', () => {
            it('turns a shot tail frame into a buffer', () => {
                expect(encodeShotTailFrame(frame).toString('hex')).toEqual(buffer.toString('hex'))
            })
        })

        describe('decodeShotTailFrame', () => {
            it('turns a buffer into a shot tail frame', () => {
                expect(decodeShotTailFrame(buffer)).toMatchObject(frame)
            })
        })
    })

    describe('toEncodedShot', () => {
        it('turns a profile into an array of buffers', () => {
            const profile: Profile = ClassicItalianEspresso as unknown as Profile

            const bufs = toEncodedShot(profile)

            expect(profile.steps.length).toBe(4)

            expect(bufs.length).toBe(7) // header + steps + 1 extension + 1 tail

            const [head, b0, b1, b2, b3, b4, b5] = bufs

            expect(decodeShotHeader(head).HeaderV).toEqual(1)

            expect(decodeShotHeader(head).NumberOfFrames).toEqual(4)

            expect(decodeShotFrame(b0!).FrameLen).toBe(2)

            expect(decodeShotFrame(b1!).FrameLen).toBe(6)

            expect(decodeShotFrame(b2!).FrameLen).toBe(3)

            expect(decodeShotFrame(b3!).FrameLen).toBe(32)

            expect(decodeShotExtensionFrame(b4!).MaxFlowOrPressure).toBe(4.5)

            expect(decodeShotTailFrame(b5!).MaxTotalVolume).toBe(0)
        })
    })
})
