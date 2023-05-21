import PrewrappedControl, { ControlProps } from '$/components/Control'
import Metric from '$/components/Metric'
import Revolver from '$/components/ui/Revolver'
import { Prop } from '$/types'
import { css } from '@emotion/react'
import React, { HTMLAttributes } from 'react'
import { toaster } from 'toasterhea'
import tw from 'twin.macro'
import ProfilesDrawer from '../drawers/ProfilesDrawer'
import { Layer } from '$/types'
import { useDataStore } from '$/stores/data'

export default function Controller() {
    const { name: profileLabel } = useDataStore().profile || {}

    return (
        <div
            css={[
                tw`
                    max-w-[69rem]
                    w-full
                    px-20
                `,
            ]}
        >
            <div
                css={[
                    css`
                        > * {
                            flex-basis: 50%;
                        }
                    `,
                    tw`
                        flex
                        -mx-4
                    `,
                ]}
            >
                <div css={[tw`px-4 flex-shrink-0`]}>
                    <Control label="Function">
                        <Revolver />
                    </Control>
                </div>
                <div css={[tw`px-4 flex-shrink-0 min-w-0`]}>
                    <Control label="Profile">
                        <button
                            onClick={async () => {
                                try {
                                    await toaster(ProfilesDrawer, Layer.Drawer).pop()
                                } catch (e) {
                                    // Do nothing.
                                }
                            }}
                            type="button"
                            css={[
                                css`
                                    -webkit-tap-highlight-color: transparent;
                                `,
                                tw`
                                    outline-none
                                    appearance-none
                                    h-full
                                    w-full
                                    text-left
                                    flex
                                    items-center
                                    px-10
                                    font-medium
                                    text-[1.75rem]
                                    text-dark-grey
                                    dark:text-lighter-grey
                                `,
                                !profileLabel &&
                                    tw`
                                        dark:text-medium-grey
                                        text-light-grey
                                    `,
                            ]}
                        >
                            <div
                                css={[
                                    tw`
                                        flex-grow
                                        min-w-0
                                        truncate
                                    `,
                                ]}
                            >
                                {profileLabel || 'No profile'}
                            </div>
                            <div
                                css={[
                                    tw`
                                        ml-6
                                    `,
                                ]}
                            >
                                <svg
                                    width="21"
                                    height="13"
                                    viewBox="0 0 21 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M20.031 1.054a1.5 1.5 0 0 1 0 2.122l-8.485 8.485a1.5 1.5 0 0 1-2.121 0L.939 3.176a1.5 1.5 0 1 1 2.122-2.122l7.424 7.425 7.425-7.425a1.5 1.5 0 0 1 2.121 0z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        </button>
                    </Control>
                </div>
            </div>
            <div css={[tw`mt-8`]}>
                <Control>
                    <div
                        css={[
                            tw`
                                h-full
                                items-center
                                flex
                                justify-between
                                px-10

                                [> *]:-translate-y-1.5
                            `,
                        ]}
                    >
                        <Metric label="Goal temp" property={Prop.ShotSteamTemp} unit="°C" />
                        <Metric label="Metal temp" property={Prop.WaterHeater} unit="°C" />
                        <Metric
                            label="Pressure"
                            property={Prop.ShotGroupPressure}
                            unit="bar"
                            formatFn={(v) => v.toFixed(1)}
                        />
                        <Metric
                            label="Flow rate"
                            property={Prop.ShotGroupFlow}
                            unit="ml/s"
                            formatFn={(v) => v.toFixed(1)}
                        />
                        <Metric
                            label="Shot time"
                            property={Prop.ShotSampleTime}
                            unit="s"
                            formatFn={(v) => v.toFixed(1)}
                        />
                    </div>
                </Control>
            </div>
        </div>
    )
}

type WrappedControlProps = ControlProps & HTMLAttributes<HTMLDivElement>

function Control(props: WrappedControlProps) {
    return (
        <PrewrappedControl
            {...props}
            fill
            css={[
                tw`
                    border
                    border-lighter-grey
                    lg:h-[144px]
                    dark:border-0
                `,
            ]}
        />
    )
}
