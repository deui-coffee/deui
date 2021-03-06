import React, { HTMLAttributes } from 'react'
import AwakenessControl from '$/components/SettingsView/AwakenessControl'
import { css } from '@emotion/react'
import tw from 'twin.macro'
import ThemeControl from '$/components/SettingsView/ThemeControl'
import { useAwake } from '$/features/machine/hooks'
import { Awake } from '$/features/machine/types'
import WaterLevelControl from '$/components/SettingsView/WaterLevelControl'
import ScaleControl from '$/components/SettingsView/ScaleControl'
import VisualizerControl from '$/components/SettingsView/VisualizerControl'

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
                {isOn ? (
                    <>
                        <Pane>
                            <VisualizerControl />
                        </Pane>
                        <Pane>
                            <ScaleControl />
                        </Pane>
                        <Pane>
                            <WaterLevelControl />
                        </Pane>
                    </>
                ) : (
                    <>
                        <Pane
                            css={[
                                css`
                                    flex-basis: 50%;
                                `,
                            ]}
                        />
                        <Pane>
                            <ThemeControl />
                        </Pane>
                    </>
                )}
                <Pane>
                    <AwakenessControl />
                </Pane>
            </div>
        </div>
    )
}

function Pane({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                css`
                    flex-basis: 25%;

                    :empty {
                        flex-grow: 1;
                    }
                `,
                tw`
                    h-full
                    flex-shrink-0

                    [& + *]:pl-[1px]
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        flex
                        flex-col
                        justify-end
                        bg-[#fafafa]
                        h-full
                        w-full
                        px-6
                        pb-6
                        dark:bg-black
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    )
}
