import React from 'react'
import tw from 'twin.macro'
import { metrics } from '../consts'
import { useMetricValue } from '../features/metric/hooks'
import { MetricId } from '../features/metric/types'
import Label from './Label'

type Props = {
    metricId: MetricId
}

export default function Metric({ metricId }: Props) {
    const value = useMetricValue(metricId)

    const { unit, label } = metrics[metricId]

    return (
        <div
            css={[
                tw`
                    [& + &]:mt-5
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
                      `,
                ]}
            >
                <span>{value}</span>
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
