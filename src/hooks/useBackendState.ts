import { CafeHubEvent, CafeHubState } from 'cafehub-client/types'
import { useEffect, useState } from 'react'
import useBackendClient from './useBackendClient'

export default function useBackendState() {
    const client = useBackendClient()

    const [state, setState] = useState<CafeHubState>(client.getState())

    useEffect(() => {
        client.on(CafeHubEvent.StateChange, setState)

        return () => {
            client.off(CafeHubEvent.StateChange, setState)
        }
    }, [client])

    return state
}
