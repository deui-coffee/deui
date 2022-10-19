import { BackendAction } from '$/features/backend'
import { CafeHubEvent, CafeHubState, ConnectionState } from 'cafehub-client/types'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useBackendClient from './useBackendClient'

export default function useBackendStateEffect() {
    const client = useBackendClient()

    const dispatch = useDispatch()

    useEffect(() => {
        function onStateChange(state: CafeHubState) {
            dispatch(BackendAction.setState(state))

            switch (state) {
                case CafeHubState.Connected:
                    return void dispatch(BackendAction.scan())
                case CafeHubState.Disconnected:
                    return void dispatch(
                        BackendAction.updateMachine({
                            connectionState: ConnectionState.Disconnected,
                        })
                    )
                default:
            }
        }

        client.on(CafeHubEvent.StateChange, onStateChange)

        return () => {
            client.off(CafeHubEvent.StateChange, onStateChange)
        }
    }, [client, dispatch])
}
