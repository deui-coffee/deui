import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectBackendUrl(state: State) {
    return state.backend.url
}

export default function useBackendUrl() {
    return useSelector(selectBackendUrl)
}
