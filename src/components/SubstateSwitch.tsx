import React from 'react'
import TextSwitch from '$/components/TextSwitch'
import { MinorState } from '$/consts'
import { useMinorState } from '$/hooks/useMinorState'

export default function SubstateSwitch() {
    const substate = useMinorState()

    return (
        <TextSwitch
            items={[
                [MinorState.HeatWaterHeater, 'Warming up'],
                [MinorState.Pour, 'Pouring'],
            ]}
            value={substate}
        />
    )
}
