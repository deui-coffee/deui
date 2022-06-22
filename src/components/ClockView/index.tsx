import React from 'react'
import Clock from '$/components/Clock'
import Toolbar from '$/components/ClockView/Toolbar'
import { HTMLAttributes } from 'react'
import tw from 'twin.macro'

export default function ClockView(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                tw`
                    w-full
                    h-full
                    relative
                    dark:bg-dark-grey
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        h-full
                        pb-[144px]
                    `,
                ]}
            >
                <div
                    css={[
                        tw`
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-center
                        `,
                    ]}
                >
                    <Clock />
                </div>
            </div>
            <Toolbar />
        </div>
    )
}
