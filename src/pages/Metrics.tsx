import React from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import Metric from '../components/Metric'
import { useViewSetter } from '../contexts/ViewSetterContext'
import { View } from '../types'

export default function Metrics() {
    const goto = useViewSetter()

    return (
        <div
            css={[
                tw`
                    px-14
                `,
            ]}
        >
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
                        justify-between
                        text-left
                        text-t1
                        w-full
                        my-8
                    `,
                ]}
                onClick={() => void goto(View.Profiles)}
            >
                <div>Best overall pressure</div>
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
            <Metric label="Metal Temp" value={56} unit="°C" />
            <Metric label="Pressure" value={0.0} unit="bar" />
            <Metric label="Flow Rate" value={0.0} unit="ml/s" />
            <Metric label="Shot Time" value={0.0} unit="s" />
            <Metric label="Weight" value={0.0} unit="g" />
        </div>
    )
}
