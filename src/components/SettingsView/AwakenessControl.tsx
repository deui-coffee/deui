import React from 'react'
import Control, { ControlProps } from '$/components/Control'
import Toggle from '../Toggle'

const labels = ['Sleep']

export default function AwakenessControl({ label = 'Power', ...props }: ControlProps) {
    return (
        <Control {...props} label={label}>
            <Toggle labels={labels} value={false} reverse />
        </Control>
    )
}
