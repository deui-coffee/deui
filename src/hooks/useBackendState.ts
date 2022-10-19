import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectBackendState(state: State) {
    return state.backend.state
}

export default function useBackendState() {
    return useSelector(selectBackendState)
}
