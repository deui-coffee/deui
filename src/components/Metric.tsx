import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'
import { usePropValue } from '$/stores/data'
import { MachineMode, Prop } from '$/types'
import { useIsMachineModeActive } from '$/hooks'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'property'> {
    property: Prop
}

function defaultFormatFn(value: number) {
    return value.toFixed(1)
}

export default function Metric({ property, ...props }: Props) {
    const value = usePropValue(property) || 0

    const active = useIsMachineModeActive()

    const metric = propToMetricMap[property]

    if (!metric) {
        return <></>
    }

    const { label, unit, formatFn = defaultFormatFn } = metric

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
    Prop[]
>

const propToMetricMap: Partial<
    Record<Prop, { label: string; unit: string; formatFn?: (value: number) => string }>
> = {
    [Prop.TargetGroupTemp]: {
        label: 'Goal temp',
        unit: '°C',
        formatFn: (v) => `${v}`,
    },
    [Prop.ShotHeadTemp]: {
        label: 'Metal temp',
        unit: '°C',
    },
    [Prop.ShotGroupPressure]: { label: 'Pressure', unit: 'bar' },
    [Prop.ShotGroupFlow]: { label: 'Flow', unit: 'ml/s' },
    [Prop.EspressoTime]: {
        label: 'Shot time',
        unit: 'sec',
        formatFn: (v) => v.toFixed(0),
    },
    [Prop.FlushTime]: {
        label: 'Time',
        unit: 'sec',
        formatFn: (v) => v.toFixed(0),
    },
    [Prop.TargetSteamTemp]: {
        label: 'Goal temp',
        unit: '°C',
        formatFn: (v) => `${v}`,
    },
    [Prop.ShotSteamTemp]: {
        label: 'Steam temp',
        unit: '°C',
        formatFn: (v) => `${v}`,
    },
    [Prop.SteamTime]: { label: 'Time', unit: 'sec', formatFn: (v) => v.toFixed(0) },
    [Prop.TargetHotWaterTemp]: {
        label: 'Goal temp',
        unit: '°C',
        formatFn: (v) => v.toFixed(0),
    },
    [Prop.TargetHotWaterVol]: {
        label: 'Goal vol',
        unit: 'ml',
        formatFn: (v) => v.toFixed(0),
    },
    [Prop.WaterTime]: {
        label: 'Time',
        unit: 'sec',
        formatFn: (v) => v.toFixed(0),
    },
}

export const Metrics: Metrics = {
    [MachineMode.Espresso]: [
        Prop.TargetGroupTemp,
        Prop.ShotHeadTemp,
        Prop.ShotGroupPressure,
        Prop.ShotGroupFlow,
        Prop.EspressoTime,
    ],
    [MachineMode.Flush]: [Prop.FlushTime],
    [MachineMode.Steam]: [
        Prop.TargetSteamTemp,
        Prop.ShotSteamTemp,
        Prop.ShotGroupPressure,
        Prop.ShotGroupFlow,
        Prop.SteamTime,
    ],
    [MachineMode.Water]: [
        Prop.TargetHotWaterTemp,
        Prop.TargetHotWaterVol,
        Prop.ShotGroupFlow,
        Prop.WaterTime,
    ],
}

export const VerticalMetrics: Metrics = {
    ...Metrics,
    [MachineMode.Espresso]: [
        Prop.ShotGroupPressure,
        Prop.ShotGroupFlow,
        Prop.EspressoTime,
        Prop.TargetGroupTemp,
        Prop.ShotHeadTemp,
    ],
}
