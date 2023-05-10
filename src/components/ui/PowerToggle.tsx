import React from 'react'
import { Buffer } from 'buffer'
import { MajorState } from '$/consts'
import { useMajorState } from '$/hooks/useMajorState'
import { CharAddr } from '$/utils/cafehub'
import { Status } from '../StatusIndicator'
import Toggle from '../Toggle'
import { useCafeHubStore } from '$/stores/ch'

const labels = ['Sleep']

function useStatus() {
    switch (useMajorState()) {
        case MajorState.Unknown:
            return Status.Idle
        case MajorState.Sleep:
            return Status.Off
        default:
            return Status.On
    }
}

export default function PowerToggle() {
    const status = useStatus()

    const state = useMajorState()

    const { write } = useCafeHubStore()

    return (
        <Toggle
            status={status}
            labels={labels}
            value={status === Status.On}
            reverse
            onChange={async () => {
                if (state === MajorState.Sleep) {
                    try {
                        await write({
                            char: CharAddr.RequestedState,
                            data: Buffer.from([MajorState.Idle]),
                        })
                    } catch (e) {
                        console.warn('Failed to wake up the machine', e)
                    }
                }

                if (state === MajorState.Idle) {
                    try {
                        await write({
                            char: CharAddr.RequestedState,
                            data: Buffer.from([MajorState.Sleep]),
                        })
                    } catch (e) {
                        console.warn('Failed to put the machine to sleep', e)
                    }
                }
            }}
        />
    )
}
