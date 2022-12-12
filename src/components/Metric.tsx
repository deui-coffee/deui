import { MetricId } from '$/types'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'

type Props = HTMLAttributes<HTMLDivElement> & {
    metricId: MetricId
}

export default function Metric({ metricId, ...props }: Props) {
    const value = 0 // TODO

    const unit = 'j.m.' // TODO

    const label = 'FIXME' // TODO

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
                <span
                    css={[
                        tw`
                            text-dark-grey
                            dark:text-lighter-grey
                        `,
                    ]}
                >
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
