import React from 'react'
import Control, { ControlProps } from '../../Control'
import ScaleSelect from '../../ScaleSelect'

export default function ScaleControl({ label = 'Scale', ...props }: ControlProps) {
    return (
        <Control {...props} label={label}>
            <ScaleSelect />
        </Control>
    )
}
