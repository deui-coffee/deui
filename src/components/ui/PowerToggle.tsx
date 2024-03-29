import React from 'react'
import { MajorState } from '$/shared/types'
import { Status } from '../StatusIndicator'
import Toggle from '../Toggle'
import { useMajorState } from '$/stores/data'
import axios from 'axios'
import { useServerUrl } from '$/hooks'

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

    const url = useServerUrl({ protocol: 'http' })

    return (
        <Toggle
            status={status}
            labels={labels}
            value={status === Status.On}
            reverse
            onChange={async () => {
                if (state === MajorState.Sleep) {
                    try {
                        await axios.post(`${url}/on`)
                    } catch (e) {
                        console.warn('Failed to wake up the machine', e)
                    }
                }

                if (state !== MajorState.Sleep) {
                    try {
                        await axios.post(`${url}/off`)
                    } catch (e) {
                        console.warn('Failed to put the machine to sleep', e)
                    }
                }
            }}
        />
    )
}
