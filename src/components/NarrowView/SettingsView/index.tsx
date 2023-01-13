import React from 'react'
import 'twin.macro'
import ThemeControl from '../../controls/ThemeControl'
import VisualizerControl from './VisualizerControl'
import ScaleControl from './ScaleControl'
import WaterLevelControl from './WaterLevelControl'
import AwakenessControl from '$/components/NarrowView/SettingsView/AwakenessControl'
import Control from '$/components/Control'
import mlToL from '$/utils/mlToL'
import useWaterCapacity from '$/hooks/useWaterCapacity'
import WaterBar from '$/components/ui/WaterBar'

export default function SettingsView() {
    const capacity = useWaterCapacity()

    return (
        <div tw="px-14">
            <Control
                label={
                    <>
                        <span>Water</span>
                        <span>{mlToL(capacity)}L MAX</span>
                    </>
                }
            >
                <WaterBar />
            </Control>
            <WaterLevelControl fill />
            <ScaleControl fill />
            <VisualizerControl fill />
            <ThemeControl pad fill />
            <AwakenessControl pad fill />
        </div>
    )
}
