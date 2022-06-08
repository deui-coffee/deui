import React from 'react'
import { metrics } from '../../consts'
import { useMetricValue } from '../../features/metric/hooks'
import { MetricId } from '../../features/metric/types'
import Control from '../Control'
import WaterLevel from '../WaterLevel'

export default function WaterLevelControl() {
    const capacity = useMetricValue(MetricId.WaterTankCapacity) || 0

    const waterLevel = useMetricValue(MetricId.WaterLevel) || 0

    const { unit: waterLevelUnit } = metrics[MetricId.WaterLevel]

    const { unit: capacityUnit } = metrics[MetricId.WaterLevel]

    return (
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
    )
}
