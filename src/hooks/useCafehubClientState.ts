import { selectCafeHubClientState } from '$/features/cafehub/selectors'
import { useSelector } from 'react-redux'

export default function useCafeHubClientState() {
    return useSelector(selectCafeHubClientState)
}
