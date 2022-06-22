import React, { useState } from 'react'
import Control, { ControlProps } from '../Control'
import Select, { Option } from '../Select'
import { Status } from '../StatusIndicator'

const VisualizerOptions: Option[] = [{ value: 'viewShot', label: 'View shot' }]

export default function VisualizerControl({ label = 'Visualizer', ...props }: ControlProps) {
    const [visualizer, setVisualizer] = useState<string | undefined>('viewShot')

    return (
        <Control {...props} label={label}>
            <Select
                onChange={setVisualizer}
                options={VisualizerOptions}
                status={Status.On}
                value={visualizer}
            />
        </Control>
    )
}
