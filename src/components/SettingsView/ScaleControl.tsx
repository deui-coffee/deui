import React from 'react'
import { useDispatch } from 'react-redux'
import { MachineAction } from '../../features/machine'
import { useScales, useSelectedScaleId } from '../../features/machine/hooks'
import Control, { ControlProps } from '../Control'
import Select from '../Select'
import { Status } from '../StatusIndicator'

export default function ScaleControl({ label = 'Scale', ...props }: ControlProps) {
    const selectedScaleId = useSelectedScaleId()

    const scales = useScales()

    const dispatch = useDispatch()

    return (
        <Control {...props} label={label}>
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
        </Control>
    )
}
