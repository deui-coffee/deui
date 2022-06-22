import PrewrappedControl, { ControlProps } from '$/components/Control'
import Metric from '$/components/Metric'
import { MetricId } from '$/features/metric/types'
import { css } from '@emotion/react'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'

export default function Controller() {
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
                <div css={[tw`px-4`]}>
                    <Control label="Function" />
                </div>
                <div css={[tw`px-4`]}>
                    <Control label="Profile" />
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
