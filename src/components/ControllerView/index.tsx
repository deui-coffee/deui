import React from 'react'
import Toolbar from '$/components/ControllerView/Toolbar'
import { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Clock from '$/components/ControllerView/Clock'
import Controller from '$/components/ControllerView/Controller'

export default function ControllerView(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                tw`
                    w-full
                    h-full
                    relative
                    bg-off-white
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
                    {/* {isOn ? <Controller /> : <Clock />} */}
                </div>
            </div>
            <Toolbar />
        </div>
    )
}
