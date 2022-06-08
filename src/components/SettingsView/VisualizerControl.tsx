import React, { useState } from 'react'
import Control from '../Control'
import Select, { Option } from '../Select'
import { Status } from '../StatusIndicator'

const VisualizerOptions: Option[] = [{ value: 'viewShot', label: 'View shot' }]

export default function VisualizerControl() {
    const [visualizer, setVisualizer] = useState<string | undefined>('viewShot')

    return (
        <Control label="Visualizer">
            <Select
                onChange={setVisualizer}
                options={VisualizerOptions}
                status={Status.On}
                value={visualizer}
            />
        </Control>
    )
}
