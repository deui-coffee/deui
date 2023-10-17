import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'
import { usePropValue } from '$/stores/data'
import { MachineMode, Prop } from '$/types'
import { useIsMachineModeActive } from '$/hooks'

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

    const active = useIsMachineModeActive()

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
            <Label css={tw`lg:justify-center`}>
                {label} {unit}
            </Label>
            <div
                css={tw`
                    lg:text-center
                    text-t2
                    lg:text-[2.5rem]
                `}
            >
                <span
                    css={[
                        tw`
                            text-light-grey
                            dark:text-medium-grey
                        `,
                        active &&
                            tw`
                                text-darker-grey
                                dark:text-lighter-grey
                            `,
                    ]}
                >
                    {formatFn(value)}
                </span>
            </div>
        </div>
    )
}

type Metrics = Record<
    MachineMode.Espresso | MachineMode.Flush | MachineMode.Steam | MachineMode.Water,
    MetricOwnProps[]
>

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
        { label: 'Shot time', property: Prop.EspressoTime, unit: 'sec' },
    ],
    [MachineMode.Flush]: [{ label: 'Time', property: Prop.FlushTime, unit: 'sec' }],
    [MachineMode.Steam]: [
        {
            label: 'Steam temp',
            property: Prop.ShotSteamTemp,
            unit: '°C',
            formatFn: (v) => `${v}`,
        },
        { label: 'Pressure', property: Prop.ShotGroupPressure, unit: 'bar' },
        { label: 'Flow', property: Prop.ShotGroupFlow, unit: 'ml/s' },
        { label: 'Time', property: Prop.SteamTime, unit: 'sec' },
    ],
    [MachineMode.Water]: [{ label: 'Time', property: Prop.WaterTime, unit: 'sec' }],
}
