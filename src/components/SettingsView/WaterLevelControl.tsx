import React from 'react'
import tw from 'twin.macro'
import { metrics } from '../../consts'
import { useMetricValue } from '../../features/metric/hooks'
import { MetricId } from '../../features/metric/types'
import Control, { ControlProps } from '../Control'
import WaterLevel from '../WaterLevel'

type Props = Omit<ControlProps, 'label'>

export default function WaterLevelControl(props: Props) {
    const capacity = useMetricValue(MetricId.WaterTankCapacity) || 0

    const waterLevel = useMetricValue(MetricId.WaterLevel) || 0

    const { unit: waterLevelUnit } = metrics[MetricId.WaterLevel]

    const { unit: capacityUnit } = metrics[MetricId.WaterLevel]

    return (
        <Control
            {...props}
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
    )
}
