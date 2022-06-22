import React from 'react'
import { useDispatch } from 'react-redux'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import Metric from '../Metric'
import { ViewAction } from '../../features/view'
import { ViewId } from '../../features/view/types'
import { MetricId } from '../../features/metric/types'
import { useProfileLabel } from '../../features/machine/hooks'

export default function Metrics() {
    const dispatch = useDispatch()

    const profileLabel = useProfileLabel()

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
                    Espresso
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
                    Warming up
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
                        border-heavy-grey
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
                onClick={() => void dispatch(ViewAction.set(ViewId.Profiles))}
            >
                <div tw="flex-grow">{profileLabel}</div>
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
                <Metric metricId={MetricId.MetalTemp} />
                <Metric metricId={MetricId.Pressure} />
                <Metric metricId={MetricId.FlowRate} />
                <Metric metricId={MetricId.ShotTime} />
                <Metric metricId={MetricId.Weight} />
            </div>
        </div>
    )
}
