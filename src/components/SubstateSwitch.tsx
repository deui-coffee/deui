import React from 'react'
import TextSwitch from '$/components/TextSwitch'
import { MinorState } from '$/consts'
import { useMinorState } from '$/stores/data'

export default function SubstateSwitch() {
    const substate = useMinorState()

    return (
        <TextSwitch
            items={[
                [MinorState.Steaming, 'Steaming'],
                [MinorState.HeatWaterTank, 'Warming up'],
                [MinorState.Pour, 'Pouring'],
            ]}
            value={substate}
        />
    )
}
