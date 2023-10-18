import React from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import Metric, { Metrics } from '../Metric'
import { MachineMode } from '$/types'
import SubstateSwitch from '$/components/SubstateSwitch'
import TextSwitch from '$/components/TextSwitch'
import { useUiStore } from '$/stores/ui'
import { ViewId } from '$/types'
import { useCurrentProfileLabel } from '$/stores/data'
import { useMetrics } from '$/hooks'

export default function MetricsView() {
    const profileLabel = useCurrentProfileLabel()

    const { setView, machineMode } = useUiStore()

    const metrics = [...useMetrics()].sort(({ vpos: a = 100 }, { vpos: b = 100 }) => a - b)

    return (
        <div tw="px-14">
            <header>
                <h1
                    css={[
                        tw`
                            dark:text-lighter-grey
                            font-medium
                            text-t2
                        `,
                    ]}
                >
                    <TextSwitch
                        items={[
                            [MachineMode.Espresso],
                            [MachineMode.Steam],
                            [MachineMode.Flush],
                            [MachineMode.Water],
                            [MachineMode.Server],
                        ]}
                        value={machineMode}
                    />
                </h1>
                <p
                    css={[
                        tw`
                            dark:text-medium-grey
                            font-medium
                            mt-1
                            text-light-grey
                            text-t0
                        `,
                    ]}
                >
                    <SubstateSwitch />
                </p>
            </header>
            <button
                type="button"
                css={[
                    css`
                        -webkit-tap-highlight-color: transparent;
                    `,
                    tw`
                        appearance-none
                        border-b
                        border-offish-white
                        dark:border-heavy-grey
                        border-t
                        flex
                        font-medium
                        h-[88px]
                        items-center
                        text-left
                        text-t1
                        w-full
                        my-8
                    `,
                ]}
                onClick={() => void setView(ViewId.Profiles)}
            >
                <div
                    css={[
                        tw`
                            flex-grow
                            truncate
                        `,
                        !profileLabel &&
                            tw`
                                dark:text-medium-grey
                                text-light-grey
                            `,
                    ]}
                >
                    {profileLabel || 'No profile'}
                </div>
                <div
                    css={[
                        tw`
                            dark:text-medium-grey
                            text-light-grey
                        `,
                    ]}
                >
                    <svg
                        width="11"
                        height="19"
                        viewBox="0 0 11 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.006 1.353a1.5 1.5 0 0 1 2.122 0l7.07 7.07a1.5 1.5 0 0 1 0 2.122l-7.066 7.067a1.5 1.5 0 0 1-2.122-2.121l6.007-6.007-6.01-6.01a1.5 1.5 0 0 1 0-2.121z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
            </button>
            <div
                css={[
                    tw`
                        [> * + *]:mt-5
                    `,
                ]}
            >
                {metrics.map((metricProps) => (
                    <Metric key={metricProps.property} {...metricProps} />
                ))}
            </div>
        </div>
    )
}
