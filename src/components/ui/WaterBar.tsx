import { Prop } from '$/types'
import React, { useRef } from 'react'
import tw from 'twin.macro'
import { useDataStore } from '$/stores/data'
import { useSmoothWaterLevelEffect } from '$/hooks/useSmoothWaterLevelEffect'

export default function WaterBar() {
    const { [Prop.WaterCapacity]: waterCapacity = 1500 } = useDataStore().properties

    const textRef = useRef<HTMLSpanElement>(null)

    const barRef = useRef<HTMLDivElement>(null)

    useSmoothWaterLevelEffect((level) => {
        if (textRef.current) {
            textRef.current.innerHTML = `${Math.floor(level * waterCapacity)}`
        }

        if (barRef.current) {
            barRef.current.style.width = `${100 * level}%`
        }
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
                ref={barRef}
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
                <span ref={textRef}>0</span>
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
