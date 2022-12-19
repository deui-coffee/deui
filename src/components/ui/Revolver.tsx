import useMode, { Mode } from '$/hooks/useMode'
import React, { HTMLAttributes, useState } from 'react'
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
                    w-full
                    text-left
                    h-[70px]
                    top-0
                    left-0
                    font-medium
                    select-none
                    text-light-grey
                    dark:text-medium-grey
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
    const [phase] = useState<number>(0)

    return (
        <div
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
    )
}
