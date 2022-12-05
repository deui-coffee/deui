import { Buffer } from 'buffer'
import { MachineState } from '$/consts'
import { BackendAction } from '$/features/backend'
import useBackendMachineMAC from '$/hooks/useBackendMachineMAC'
import useIsMachineConnected from '$/hooks/useIsMachineConnected'
import useIsPairing from '$/hooks/useIsPairing'
import useIsScanning from '$/hooks/useIsScanning'
import { CharAddr } from 'cafehub-client/types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { Status } from './StatusIndicator'
import Toggle from './Toggle'

const labels = ['Sleep']

function useStatus() {
    const isPairing = useIsPairing()

    const isScanning = useIsScanning()

    const isMachineConnected = useIsMachineConnected()

    if (isPairing || isScanning) {
        return Status.Busy
    }

    return isMachineConnected ? Status.On : Status.Off
}

export default function PowerToggle() {
    const status = useStatus()

    const dispatch = useDispatch()

    const mac = useBackendMachineMAC()

    return (
        <Toggle
            status={status}
            labels={labels}
            value={false}
            reverse
            onChange={(newValue) => {
                console.log('WHAT GOING ON?', status, mac)

                if (status !== Status.On || !newValue || !mac) {
                    return
                }

                dispatch(
                    BackendAction.write({
                        char: CharAddr.RequestedState,
                        data: Buffer.alloc(1, MachineState.Idle).toString('base64'),
                        mac,
                        requireResponse: false,
                    })
                )
            }}
        />
    )
}
