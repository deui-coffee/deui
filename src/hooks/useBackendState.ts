import { ClientState, EventName } from '$/utils/ws-client'
import { useEffect, useState } from 'react'
import useBackendClient from './useBackendClient'

export default function useBackendState() {
    const client = useBackendClient()

    const [state, setState] = useState<ClientState>(client.getState())

    useEffect(() => {
        client.on(EventName.StateChange, setState)

        return () => {
            client.off(EventName.StateChange, setState)
        }
    }, [client])

    return state
}
