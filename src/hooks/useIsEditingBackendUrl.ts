import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectIsEditingBackendUrl(state: State) {
    return state.misc.ui.isEditingBackendUrl
}

export default function useIsEditingBackendUrl() {
    return useSelector(selectIsEditingBackendUrl)
}
