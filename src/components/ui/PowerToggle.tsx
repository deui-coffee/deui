import React from 'react'
import { MajorState } from '$/types'
import { Status } from '../StatusIndicator'
import Toggle from '../Toggle'
import { exec, useMajorState } from '$/stores/data'

const labels = ['Sleep']

function useStatus() {
    const majorState = useMajorState()

    if (typeof majorState === 'undefined') {
        return Status.Idle
    }

    switch (majorState) {
        case MajorState.Sleep:
            return Status.Off
        default:
            return Status.On
    }
}

export default function PowerToggle() {
    const status = useStatus()

    const state = useMajorState()

    return (
        <Toggle
            status={status}
            labels={labels}
            value={status === Status.On}
            reverse
            onChange={async () => {
                if (state === MajorState.Sleep) {
                    try {
                        await exec('on')
                    } catch (e) {
                        console.warn('Failed to wake up the machine', e)
                    }
                }

                if (state === MajorState.Idle) {
                    try {
                        await exec('off')
                    } catch (e) {
                        console.warn('Failed to put the machine to sleep', e)
                    }
                }
            }}
        />
    )
}
