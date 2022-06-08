import React, { useState } from 'react'
import tw from 'twin.macro'
import Control from '../components/Control'
import WaterLevel from '../components/WaterLevel'
import Select from '../components/Select'
import Toggle from '../components/Toggle'
import { Status } from '../components/StatusIndicator'
import { useDispatch } from 'react-redux'
import { Theme } from '../features/ui/types'
import { useTheme } from '../features/ui/hooks'
import { UiAction } from '../features/ui'
import { useMetricValue } from '../features/metric/hooks'
import { MetricId } from '../features/metric/types'
import { metrics } from '../consts'

enum Power {
    On = 'on',
    Off = 'off',
}

const Scales: [string, string][] = [
    ['acaia', 'Acaia Lunar'],
    ['wh', 'WH-1000XM4'],
    ['de-sc', 'Decent scale'],
    ['m.a.p', 'Matt’s Airpods Pro'],
]

const VisualizerOptions: [string, string][] = [['viewShot', 'View shot']]

export default function Settings() {
    const dispatch = useDispatch()

    const theme = useTheme()

    const [power, setPower] = useState<Power>(Power.Off)

    const [scale, setScale] = useState<string | undefined>()

    const [visualizer, setVisualizer] = useState<string | undefined>('viewShot')

    const capacity = useMetricValue(MetricId.WaterTankCapacity) || 0

    const waterLevel = useMetricValue(MetricId.WaterLevel) || 0

    const { unit: waterLevelUnit } = metrics[MetricId.WaterLevel]

    const { unit: capacityUnit } = metrics[MetricId.WaterLevel]

    return (
        <div
            css={[
                tw`
          px-14
        `,
            ]}
        >
            <Control
                label={
                    <>
                        <span>Water tank</span>
                        <span>
                            {capacity}
                            {capacityUnit}
                        </span>
                    </>
                }
            >
                <WaterLevel capacity={capacity} unit={waterLevelUnit} value={waterLevel} />
            </Control>
            <Control label="Scale">
                <Select
                    onChange={setScale}
                    options={Scales}
                    placeholder="Connect"
                    status={Status.Busy}
                    value={scale}
                />
            </Control>
            <Control label="Visualizer">
                <Select
                    onChange={setVisualizer}
                    options={VisualizerOptions}
                    status={Status.On}
                    value={visualizer}
                />
            </Control>
            <Control label="Theme">
                <Toggle
                    onChange={(newTheme) => void dispatch(UiAction.setTheme(newTheme as Theme))}
                    options={[
                        [Theme.Dark as string, 'Dark'],
                        [Theme.Light as string, 'Light'],
                    ]}
                    value={theme}
                />
            </Control>
            <Control label="Power">
                <Toggle
                    status={(p: string) => {
                        if (p !== power) {
                            return Status.Idle
                        }

                        return p === Power.On ? Status.Busy : Status.Off
                    }}
                    onChange={(newPower) => void setPower(newPower as Power)}
                    options={[
                        [Power.Off as string, 'Off'],
                        [Power.On as string, 'On'],
                    ]}
                    value={power}
                />
            </Control>
        </div>
    )
}
