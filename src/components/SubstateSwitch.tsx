import React from 'react'
import TextSwitch from '$/components/TextSwitch'
import { MinorState } from '$/types'
import { useMinorState } from '$/stores/data'

export default function SubstateSwitch() {
    const substate = useMinorState()

    return (
        <TextSwitch
            items={[
                [MinorState.Steaming, 'Steaming'],
                [MinorState.HeatWaterTank, 'Warming up'],
                [MinorState.HeatWaterHeater, 'Warming up'],
                [MinorState.StabilizeMixTemp, 'Stabilizing'],
                [MinorState.PreInfuse, 'Preinfuse'],
                [MinorState.Pour, 'Pouring'],
                [MinorState.Flush, 'Flushing'],
            ]}
            value={substate}
        />
    )
}
