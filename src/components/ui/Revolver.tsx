import { usePropValue } from '$/stores/data'
import { MachineMode, MajorState, Prop } from '$/types'
import { css } from '@emotion/react'
import { useSwipeable } from 'react-swipeable'
import { ButtonHTMLAttributes, useEffect, useState } from 'react'
import tw from 'twin.macro'
import { machineModeLineup, useUiStore } from '$/stores/ui'

interface ItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    mode: MachineMode
    active?: boolean
}

function Item({ mode, active = false, ...props }: ItemProps) {
    const [transitions, setTransitions] = useState(false)

    useEffect(() => void setTransitions(true), [])

    return (
        <button
            {...props}
            type="button"
            css={[
                css`
                    -webkit-tap-highlight-color: transparent;
                `,
                tw`
                    appearance-none
                    outline-none
                    items-center
                    absolute
                    px-10
                    flex
                    text-left
                    h-[70px]
                    w-full
                    top-0
                    left-0
                    font-medium
                    select-none
                    text-light-grey
                    dark:text-medium-grey
                    `,
                transitions &&
                    tw`
                        transition-colors
                        delay-100
                    `,
                active &&
                    tw`
                        text-dark-grey
                        dark:text-lighter-grey
                    `,
                transitions && active && tw`delay-500`,
            ]}
        >
            {mode}
        </button>
    )
}

const n = machineModeLineup.length

const limit = 500

function getMode(phase: number): MachineMode {
    return machineModeLineup[((phase % n) + n) % n]
}

export default function Revolver() {
    const [phase, setPhase] = useState(0)

    const handlers = useSwipeable({
        preventDefaultTouchmoveEvent: true,
        onSwipedUp() {
            setPhase((current) => current + 1)
        },
        onSwipedDown() {
            setPhase((current) => current - 1)
        },
    })

    const { setMachineMode } = useUiStore()

    useEffect(() => {
        setMachineMode(getMode(phase))
    }, [phase, setMachineMode])

    const majorState = usePropValue(Prop.MajorState)

    useEffect(() => {
        const newMode =
            typeof majorState === 'undefined'
                ? void 0
                : {
                      [MajorState.Steam]: MachineMode.Steam,
                      [MajorState.HotWater]: MachineMode.Water,
                      [MajorState.HotWaterRinse]: MachineMode.Flush,
                  }[majorState]

        const to = machineModeLineup.indexOf(newMode || MachineMode.Espresso)

        setPhase((c) => {
            const from = (n + (c % n)) % n

            const right = (to - from + n) % n

            const left = (to - from - n) % n

            const absRight = Math.abs(right)

            const absLeft = Math.abs(left)

            return (
                c +
                (absLeft === absRight ? (c <= 0 ? right : left) : absRight < absLeft ? right : left)
            )
        })
    }, [majorState])

    return (
        <div
            {...handlers}
            css={[
                tw`
                    h-full
                    overflow-hidden
                    text-white
                    text-[1.75rem]
                    relative
                `,
            ]}
        >
            <div
                style={{
                    transform: `translateY(${(144 - 70) / 2}px) translateY(${-phase * 70}px)`,
                }}
                css={[
                    tw`
                        transition-transform
                        duration-500
                    `,
                ]}
            >
                {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(
                    (i) =>
                        Math.abs(phase + i) < limit && (
                            <Item
                                onClick={() => {
                                    setPhase(phase + i)
                                }}
                                active={!i}
                                key={phase + i}
                                mode={getMode(phase + i)}
                                style={{
                                    top: `${(phase + i) * 70}px`,
                                }}
                            />
                        )
                )}
            </div>
        </div>
    )
}
