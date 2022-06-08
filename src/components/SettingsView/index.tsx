import React, { useState } from 'react'
import tw from 'twin.macro'
import Control from '../Control'
import WaterLevel from '../WaterLevel'
import Select from '../Select'
import Toggle from '../Toggle'
import { Status } from '../StatusIndicator'
import { useDispatch } from 'react-redux'
import { Theme } from '../../features/ui/types'
import { useTheme } from '../../features/ui/hooks'
import { UiAction } from '../../features/ui'
import { useMetricValue } from '../../features/metric/hooks'
import { MetricId } from '../../features/metric/types'
import { metrics } from '../../consts'
import { useAwake } from '../../features/machine/hooks'
import { Awake } from '../../features/machine/types'
import { MachineAction } from '../../features/machine'

const Scales: [string, string][] = [
    ['acaia', 'Acaia Lunar'],
    ['wh', 'WH-1000XM4'],
    ['de-sc', 'Decent scale'],
    ['m.a.p', 'Matt’s Airpods Pro'],
]

const VisualizerOptions: [string, string][] = [['viewShot', 'View shot']]

export default function SettingsView() {
    const dispatch = useDispatch()

    const theme = useTheme()

    const awake = useAwake()

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
                    status={(a: string) => {
                        if (a !== awake || a !== Awake.Yes) {
                            return Status.Idle
                        }

                        return Status.Busy
                    }}
                    onChange={(newAwake) =>
                        void dispatch(MachineAction.setAwake(newAwake as Awake))
                    }
                    options={[
                        [Awake.No as string, 'Asleep'],
                        [Awake.Yes as string, 'Awake'],
                    ]}
                    value={awake}
                />
            </Control>
        </div>
    )
}
