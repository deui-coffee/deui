import React from 'react'
import Control, { ControlProps } from '../../Control'
import WaterLevel from '../../WaterLevel'

type Props = Omit<ControlProps, 'label'>

export default function WaterLevelControl(props: Props) {
    const capacity = 0 // TODO

    const waterLevel = 0 // TODO

    // TODO dynamic units (taken from metrics)

    return (
        <Control
            {...props}
            label={
                <>
                    <span>Water tank</span>
                    <span>{capacity}ml</span>
                </>
            }
        >
            <WaterLevel capacity={capacity} unit="ml" value={waterLevel} />
        </Control>
    )
}
