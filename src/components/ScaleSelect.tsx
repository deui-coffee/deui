import React from 'react'
import Select from './Select'
import { Status } from './StatusIndicator'

export default function ScaleSelect() {
    return (
        <Select
            onChange={(scaleId) => {
                throw new Error(`Not implemented, ${scaleId}`)
            }}
            placeholder="Connect"
            status={Status.Busy}
        />
    )
}
