import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectCafeHubPhase(state: State) {
    return state.cafehub.phase
}

export default function useCafeHubPhase() {
    return useSelector(selectCafeHubPhase)
}
