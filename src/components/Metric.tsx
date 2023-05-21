import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'
import { usePropValue } from '$/stores/data'
import { Prop } from '$/types'

type Props = HTMLAttributes<HTMLDivElement> & {
    property: Prop
    label: string
    unit: string
    formatFn?: (value: number) => string
}

function defaultFormatFn(value: number) {
    return value.toFixed(1)
}

export default function Metric({
    property,
    label = 'Label',
    unit = 'IU',
    formatFn = defaultFormatFn,
    ...props
}: Props) {
    const value = usePropValue(property) || 0

    return (
        <div
            {...props}
            css={[
                tw`
                    font-medium
                    select-none
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
                    !value &&
                        tw`
                            opacity-20
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
                    {formatFn(value)}
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
