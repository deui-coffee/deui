import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectTransientBackendUrl(state: State) {
    const { transientBackendUrl, backendUrl } = state.misc.settings
    return typeof transientBackendUrl === 'undefined' ? backendUrl : transientBackendUrl
}

export default function useTransientBackendUrl() {
    return useSelector(selectTransientBackendUrl)
}
