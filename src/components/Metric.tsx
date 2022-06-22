import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import { metrics } from '../consts'
import { useMetricValue } from '../features/metric/hooks'
import { MetricId } from '../features/metric/types'
import Label from './Label'

type Props = HTMLAttributes<HTMLDivElement> & {
    metricId: MetricId
}

export default function Metric({ metricId, ...props }: Props) {
    const value = useMetricValue(metricId)

    const { unit, label } = metrics[metricId]

    return (
        <div
            {...props}
            css={[
                tw`
                    font-medium
                `,
            ]}
        >
            <Label>{label}</Label>
            <div
                css={[
                    tw`
                        -mt-1
                        text-t2
                        lg:text-[2.5rem]
                      `,
                ]}
            >
                <span>
                    {metricId === MetricId.MetalTemp || typeof value === 'undefined'
                        ? value
                        : value.toFixed(1)}
                </span>
                <span
                    css={[
                        tw`
                            dark:text-medium-grey
                            ml-2
                            text-light-grey
                        `,
                    ]}
                >
                    {unit}
                </span>
            </div>
        </div>
    )
}
