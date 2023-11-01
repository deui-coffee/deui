import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'
import { useMinorState, usePropValue } from '$/stores/data'
import { MachineMode, MinorState, Prop } from '$/types'
import { useIsMachineModeActive } from '$/hooks'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'property'> {
    property: Prop | ((idle: boolean) => Prop)
}

function defaultFormatFn(value: number) {
    return value.toFixed(1)
}

export default function Metric({ property: propertyProp, ...props }: Props) {
    const minorState = useMinorState()

    const idle = (() => {
        switch (minorState) {
            case MinorState.Flush:
            case MinorState.Pour:
            case MinorState.PreInfuse:
            case MinorState.HeatWaterHeater:
                return false
            default:
        }

        return true
    })()

    const property = typeof propertyProp === 'function' ? propertyProp(idle) : propertyProp

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
    (Prop | ((idle?: boolean) => Prop))[]
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
    [Prop.Pressure]: { label: 'Pressure', unit: 'bar' },
    [Prop.Flow]: { label: 'Flow', unit: 'ml/s' },
    [Prop.RecentEspressoMaxPressure]: { label: 'Max pressure', unit: 'bar' },
    [Prop.RecentEspressoMaxFlow]: { label: 'Max flow', unit: 'ml/s' },
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
        (idle) => (idle ? Prop.RecentEspressoMaxPressure : Prop.Pressure),
        (idle) => (idle ? Prop.RecentEspressoMaxFlow : Prop.Flow),
        Prop.EspressoTime,
    ],
    [MachineMode.Flush]: [Prop.FlushTime],
    [MachineMode.Steam]: [
        Prop.TargetSteamTemp,
        Prop.ShotSteamTemp,
        Prop.Pressure,
        Prop.Flow,
        Prop.SteamTime,
    ],
    [MachineMode.Water]: [
        Prop.TargetHotWaterTemp,
        Prop.TargetHotWaterVol,
        Prop.Flow,
        Prop.WaterTime,
    ],
}

export const VerticalMetrics: Metrics = {
    ...Metrics,
    [MachineMode.Espresso]: [
        (idle) => (idle ? Prop.RecentEspressoMaxPressure : Prop.Pressure),
        (idle) => (idle ? Prop.RecentEspressoMaxFlow : Prop.Flow),
        Prop.EspressoTime,
        Prop.TargetGroupTemp,
        Prop.ShotHeadTemp,
    ],
}
