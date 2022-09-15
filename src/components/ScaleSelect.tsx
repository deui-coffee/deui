import React from 'react'
import { useDispatch } from 'react-redux'
import { MachineAction } from '../features/machine'
import { useScales, useSelectedScaleId } from '../features/machine/hooks'
import Select from './Select'
import { Status } from './StatusIndicator'

export default function ScaleSelect() {
    const selectedScaleId = useSelectedScaleId()

    const scales = useScales()

    const dispatch = useDispatch()

    return (
        <Select
            onChange={(scaleId) => void dispatch(MachineAction.selectScale(scaleId))}
            options={scales.map(({ id, label }) => ({
                value: id,
                label,
            }))}
            placeholder="Connect"
            status={Status.Busy}
            value={selectedScaleId}
        />
    )
}
