import React from 'react'
import Control from '$/components/Control'
import WaterBar from '$/components/ui/WaterBar'
import useWaterCapacity from '$/hooks/useWaterCapacity'

export default function WaterControl() {
    const capacity = useWaterCapacity()

    return (
        <Control
            label={
                <>
                    <span>Water</span>
                    <span>{capacity}ml</span>
                </>
            }
        >
            <WaterBar />
        </Control>
    )
}
