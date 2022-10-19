import useIsMachineConnected from '$/hooks/useIsMachineConnected'
import useIsPairing from '$/hooks/useIsPairing'
import useIsScanning from '$/hooks/useIsScanning'
import React from 'react'
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

    return <Toggle status={status} labels={labels} value={false} reverse />
}
