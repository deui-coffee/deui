import PrewrappedControl, { ControlProps } from '$/components/Control'
import Metric from '$/components/Metric'
import Revolver from '$/components/Revolver'
import { useProfileLabel } from '$/features/machine/hooks'
import { MetricId } from '$/features/metric/types'
import useToggleProfilesDrawer from '$/hooks/useToggleProfilesDrawer'
import { css } from '@emotion/react'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'

export default function Controller() {
    const profileLabel = useProfileLabel()

    const toggleProfilesDrawer = useToggleProfilesDrawer()

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
                            onClick={() => void toggleProfilesDrawer(true)}
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
                                {profileLabel}
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
                        <Metric metricId={MetricId.MetalTemp} />
                        <Metric metricId={MetricId.Pressure} />
                        <Metric metricId={MetricId.FlowRate} />
                        <Metric metricId={MetricId.ShotTime} />
                        <Metric metricId={MetricId.Weight} />
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
