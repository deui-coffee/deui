import React, { HTMLAttributes } from 'react'
import AwakenessControl from '$/components/SettingsView/AwakenessControl'
import { css } from '@emotion/react'
import tw from 'twin.macro'
import ThemeControl from '$/components/SettingsView/ThemeControl'
import { useAwake } from '$/features/machine/hooks'
import { Awake } from '$/features/machine/types'

export default function Toolbar() {
    const isOn = useAwake() === Awake.Yes

    return (
        <div
            css={[
                tw`
                    absolute
                    bottom-0
                    h-[144px]
                    left-0
                    w-full
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        h-full
                        w-full
                        flex
                    `,
                ]}
            >
                <Pane />
                {isOn ? (
                    <></>
                ) : (
                    <>
                        <Pane>
                            <ThemeControl tw="h-20" />
                        </Pane>
                    </>
                )}
                <Pane>
                    <AwakenessControl tw="h-20" />
                </Pane>
            </div>
        </div>
    )
}

function Pane(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                css`
                    flex-basis: 25%;

                    :empty {
                        flex-grow: 1;
                        flex-basis: auto;
                    }
                `,
                tw`
                    bg-[#fafafa]
                    dark:bg-black
                    h-full
                    px-6
                    pb-6
                    flex
                    flex-col
                    justify-end

                    [& + *]:ml-[1px]
                `,
            ]}
        />
    )
}
