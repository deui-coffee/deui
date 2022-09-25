import { State } from '$/types'
import { useSelector } from 'react-redux'

export function selectBackendClient(state: State) {
    return state.backend.client
}

export default function useBackendClient() {
    return useSelector(selectBackendClient)
}
