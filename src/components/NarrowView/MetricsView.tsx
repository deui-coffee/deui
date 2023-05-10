import React from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import Metric from '../Metric'
import { Property } from '$/types'
import SubstateSwitch from '$/components/SubstateSwitch'
import TextSwitch from '$/components/TextSwitch'
import useMode, { Mode } from '$/hooks/useMode'
import { useUiStore } from '$/stores/ui'
import { ViewId } from '$/types'
import { useCafeHubStore } from '$/stores/ch'

export default function MetricsView() {
    const { name: profileLabel } = useCafeHubStore().profile || {}

    const mode = useMode()

    const { setView } = useUiStore()

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
                        items={[[Mode.Espresso], [Mode.Steam], [Mode.Flush], [Mode.Water]]}
                        value={mode}
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
                        tw`flex-grow`,
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
                <Metric label="Goal temp" property={Property.TargetWaterHeater} unit="°C" />
                <Metric label="Metal temp" property={Property.WaterHeater} unit="°C" />
                <Metric
                    label="Pressure"
                    property={Property.ShotGroupPressure}
                    unit="bar"
                    formatFn={(v) => v.toFixed(1)}
                />
                <Metric
                    label="Flow rate"
                    property={Property.ShotGroupFlow}
                    unit="ml/s"
                    formatFn={(v) => v.toFixed(1)}
                />
                <Metric
                    label="Shot time"
                    property={Property.ShotSampleTime}
                    unit="s"
                    formatFn={(v) => v.toFixed(1)}
                />
            </div>
        </div>
    )
}
