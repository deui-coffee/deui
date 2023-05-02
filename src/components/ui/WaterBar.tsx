import { Property } from '$/types'
import React from 'react'
import tw from 'twin.macro'
import { useCafeHubStore, usePropertyValue } from '$/stores/ch'

export default function WaterBar() {
    const { waterCapacity } = useCafeHubStore().machine

    const level = usePropertyValue(Property.WaterLevel, {
        defaultValue: 0,
    })

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
                    bg-white
                    dark:bg-black
                    lg:border
                    lg:border-lighter-grey
                    lg:bg-white
                    dark:lg:border-0
                    dark:lg:bg-darkish-grey
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        absolute
                        bg-lightBlue
                        dark:bg-navy
                        h-full
                        left-0
                        top-0
                    `,
                ]}
                style={{
                    width: `${100 * level}%`,
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
                <span>{Math.floor(level * waterCapacity)}</span>
                <span
                    css={[
                        tw`
                            ml-1
                            text-light-grey
                            dark:text-medium-grey
                        `,
                    ]}
                >
                    ml
                </span>
            </div>
        </div>
    )
}
