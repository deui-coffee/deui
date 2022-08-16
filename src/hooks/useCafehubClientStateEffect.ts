import { CafeHubAction } from '$/features/cafehub'
import useCafeHubClient from '$/hooks/useCafeHubClient'
import { CafeHubClientEvent, CafeHubClientState } from 'cafehub-client/types'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function isCafeHubClientState(value: unknown): value is CafeHubClientState {
    switch (value) {
        case CafeHubClientState.Connected:
        case CafeHubClientState.Connecting:
        case CafeHubClientState.Disconnected:
        case CafeHubClientState.Disconnecting:
            return true
        default:
            return false
    }
}

export default function useCafeHubClientStateEffect() {
    const cafehubClient = useCafeHubClient()

    const dispatch = useDispatch()

    useEffect(() => {
        function onStateChange(state: unknown) {
            if (!isCafeHubClientState(state)) {
                return
            }

            dispatch(CafeHubAction.setClientState(state))
        }

        cafehubClient.on(CafeHubClientEvent.StateChange, onStateChange)

        return () => {
            cafehubClient.off(CafeHubClientEvent.StateChange, onStateChange)
        }
    }, [cafehubClient])
}
