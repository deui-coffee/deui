import React from 'react'
import 'twin.macro'
import ThemeControl from './ThemeControl'
import VisualizerControl from './VisualizerControl'
import ScaleControl from './ScaleControl'
import WaterLevelControl from './WaterLevelControl'
import AwakenessControl from './AwakenessControl'

export default function SettingsView() {
    return (
        <div tw="px-14">
            <WaterLevelControl />
            <ScaleControl />
            <VisualizerControl />
            <ThemeControl />
            <AwakenessControl />
        </div>
    )
}
