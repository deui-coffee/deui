import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectBackendUrl(state: State) {
    return state.misc.settings.backendUrl
}

export default function useBackendUrl() {
    return useSelector(selectBackendUrl)
}
