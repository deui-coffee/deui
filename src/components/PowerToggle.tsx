import { Buffer } from 'buffer'
import { MajorState } from '$/consts'
import { CafeHubAction } from '$/features/cafehub'
import { useMajorState } from '$/hooks/useMajorState'
import { CharAddr } from 'cafehub-client/types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { Status } from './StatusIndicator'
import Toggle from './Toggle'
import { useMinorState } from '$/hooks/useMinorState'

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

    console.log(state, useMinorState())

    const dispatch = useDispatch()

    return (
        <Toggle
            status={status}
            labels={labels}
            value={status === Status.On}
            reverse
            onChange={() => {
                if (state === MajorState.Sleep) {
                    dispatch(
                        CafeHubAction.write({
                            char: CharAddr.RequestedState,
                            data: Buffer.from([MajorState.Idle]),
                        })
                    )
                }

                if (state === MajorState.Idle) {
                    dispatch(
                        CafeHubAction.write({
                            char: CharAddr.RequestedState,
                            data: Buffer.from([MajorState.Sleep]),
                        })
                    )
                }
            }}
        />
    )
}
