import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'
import { usePropValue } from '$/stores/data'
import { MachineMode, Prop } from '$/types'

interface MetricOwnProps {
    property: Prop
    label: string
    unit: string
    formatFn?: (value: number) => string
}

type Props = Omit<HTMLAttributes<HTMLDivElement>, keyof MetricOwnProps> & MetricOwnProps

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

type Metrics = Record<MachineMode, MetricOwnProps[]>

export const Metrics: Metrics = {
    [MachineMode.Espresso]: [
        {
            label: 'Goal temp',
            property: Prop.TargetGroupTemp,
            unit: '°C',
            formatFn: (v) => `${v}`,
        },
        { label: 'Metal temp', property: Prop.ShotHeadTemp, unit: '°C' },
        { label: 'Pressure', property: Prop.ShotGroupPressure, unit: 'bar' },
        { label: 'Flow', property: Prop.ShotGroupFlow, unit: 'ml/s' },
        { label: 'Shot time', property: Prop.ShotSampleTime, unit: 's' },
    ],
    [MachineMode.Flush]: [],
    [MachineMode.Steam]: [
        {
            label: 'Steam temp',
            property: Prop.ShotSteamTemp,
            unit: '°C',
            formatFn: (v) => `${v}`,
        },
        { label: 'Pressure', property: Prop.ShotGroupPressure, unit: 'bar' },
        { label: 'Flow', property: Prop.ShotGroupFlow, unit: 'ml/s' },
        { label: 'Shot time', property: Prop.ShotSampleTime, unit: 's' },
    ],
    [MachineMode.Water]: [],
}
