import { MinorState } from '$/consts'
import { useMinorState } from '$/hooks/useMinorState'
import useMode, { Mode } from '$/hooks/useMode'
import { css } from '@emotion/react'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'

interface ItemProps extends HTMLAttributes<HTMLDivElement> {
    mode: Mode
}

function Item({ mode, ...props }: ItemProps) {
    const active = useMode() === mode

    return (
        <div
            {...props}
            css={[
                tw`
                    items-center
                    absolute
                    px-10
                    flex
                    text-left
                    h-[70px]
                    top-0
                    left-0
                    font-medium
                    select-none
                    text-light-grey
                    dark:text-medium-grey
                    delay-500
                    transition-colors
                `,
                active &&
                    tw`
                        text-dark-grey
                        dark:text-lighter-grey
                    `,
            ]}
        >
            {mode}
        </div>
    )
}

const lineup = [Mode.Espresso, Mode.Steam, Mode.Flush, Mode.Water]

const n = lineup.length

const limit = 500

export default function Revolver() {
    const phase = lineup.indexOf(useMode())

    const substate = useMinorState()

    return (
        <div
            css={[
                tw`
                    items-center
                    flex
                    h-full
                `,
            ]}
        >
            <div
                css={[
                    css`
                        flex-shrink: 0;
                    `,
                    tw`
                        h-full
                        overflow-hidden
                        text-white
                        text-[1.75rem]
                        relative
                        w-1/2
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
                    {[-2, -1, 0, 1, 2].map(
                        (i) =>
                            Math.abs(phase + i) < limit && (
                                <Item
                                    key={phase + i}
                                    mode={lineup[(((phase + i) % n) + n) % n]}
                                    style={{
                                        top: `${(phase + i) * 70}px`,
                                    }}
                                />
                            )
                    )}
                </div>
            </div>
            <div
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
                &zwnj;
                <Substate active={substate === MinorState.HeatWaterHeater}>Warming up</Substate>
                <Substate active={substate === MinorState.Pour}>Pouring</Substate>
            </div>
        </div>
    )
}

interface SubstateProps extends HTMLAttributes<HTMLSpanElement> {
    active?: boolean
}

function Substate({ active = false, ...props }: SubstateProps) {
    return (
        <span
            {...props}
            css={[
                css`
                    transition: 200ms ease-out;
                    transition-property: visibility, opacity;
                    transition-delay: 100ms, 0s;
                `,
                tw`
                    absolute
                    invisible
                    opacity-0
                `,
                active &&
                    tw`
                        visible
                        opacity-100
                    `,
                active &&
                    css`
                        transition-delay: 200ms;
                        transition-timing-function: ease-in;
                    `,
            ]}
        />
    )
}
