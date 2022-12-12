import React from 'react'
import { Status } from './StatusIndicator'
import Toggle from './Toggle'

const labels = ['Sleep']

function useStatus() {
    return Status.Off // TODO
}

export default function PowerToggle() {
    const status = useStatus()

    return (
        <Toggle
            status={status}
            labels={labels}
            value={false}
            reverse
            onChange={
                (/* newValue */) => {
                    throw new Error('Not implemented')
                }
            }
        />
    )
}
