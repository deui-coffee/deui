import SubstateSwitch from '$/components/SubstateSwitch'
import { useMachineMode } from '$/stores/data'
import { MachineMode } from '$/types'
import { css } from '@emotion/react'
import { useSwipeable } from 'react-swipeable'
import React, { ButtonHTMLAttributes, useEffect, useState } from 'react'
import tw from 'twin.macro'
import { useUiStore } from '$/stores/ui'

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

const lineup = [MachineMode.Espresso, MachineMode.Steam, MachineMode.Flush, MachineMode.Water]

const n = lineup.length

const limit = 500

function getMode(phase: number): MachineMode {
    return lineup[((phase % n) + n) % n]
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

                                    setMachineMode(getMode(phase + i))
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

{
    /* <div
css={[
    css`
        flex-grow: 1;
    `,
    tw`
        text-medium-grey
        text-[28px]
        font-medium
        select-none
        relative
    `,
]}
>
<SubstateSwitch />
</div> */
}
