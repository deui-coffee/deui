import { Property } from '$/types'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'
import { usePropertyValue } from '$/stores/ch'

type Props = HTMLAttributes<HTMLDivElement> & {
    property: Property
    label: string
    unit: string
    formatFn?: (value: number) => string
}

function defaultFormatFn(value: number) {
    return `${value}`
}

export default function Metric({
    property,
    label = 'Label',
    unit = 'IU',
    formatFn = defaultFormatFn,
    ...props
}: Props) {
    const value = usePropertyValue(property, {
        defaultValue: 0,
    })

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
