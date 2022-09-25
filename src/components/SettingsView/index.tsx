import React from 'react'
import 'twin.macro'
import ThemeControl from '../controls/ThemeControl'
import VisualizerControl from './VisualizerControl'
import ScaleControl from './ScaleControl'
import WaterLevelControl from './WaterLevelControl'
import AwakenessControl from '$/components/SettingsView/AwakenessControl'

export default function SettingsView() {
    return (
        <div tw="px-14">
            <WaterLevelControl fill />
            <ScaleControl fill />
            <VisualizerControl fill />
            <ThemeControl pad fill />
            <AwakenessControl pad fill />
        </div>
    )
}
