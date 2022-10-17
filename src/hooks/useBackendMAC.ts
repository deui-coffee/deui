import { State } from '$/types'
import { useSelector } from 'react-redux'

export function selectBackendMAC(state: State) {
    return state.backend.mac
}

export default function useBackendMAC() {
    return useSelector(selectBackendMAC)
}
