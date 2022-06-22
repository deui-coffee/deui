import React from 'react'
import tw from 'twin.macro'

type Props = {
    capacity?: number
    className?: string
    unit?: string
    value?: number
}

export default function WaterLevel({ value = 0, capacity = 1500, unit = 'ml' }: Props) {
    const clampedValue = Math.max(0, Math.min(capacity, value))

    return (
        <div
            css={[
                tw`
                    font-medium
                    h-full
                    relative
                    w-full
                    rounded-lg
                    overflow-hidden
                    lg:border
                    lg:border-lighter-grey
                    dark:lg:border-0
                    lg:bg-white
                    dark:lg:bg-darkish-grey
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        absolute
                        bg-blue
                        lg:bg-[#CAE6FF]
                        dark:lg:bg-dark-blue
                        h-full
                        left-0
                        top-0
                    `,
                ]}
                style={{
                    width: `${100 * (clampedValue / capacity)}%`,
                }}
            />
            <div
                css={[
                    tw`
                        -translate-x-1/2
                        -translate-y-1/2
                        absolute
                        left-1/2
                        text-[1.25rem]
                        top-1/2
                        text-darker-grey
                        dark:text-lighter-grey
                    `,
                ]}
            >
                <span>{clampedValue}</span>
                <span
                    css={[
                        tw`
                            ml-1
                            text-light-grey
                            dark:text-medium-grey
                        `,
                    ]}
                >
                    {unit}
                </span>
            </div>
        </div>
    )
}
