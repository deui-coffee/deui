import { selectCafeHubClient } from '$/features/misc/selectors'
import { useSelector } from 'react-redux'

export default function useCafeHubClient() {
    return useSelector(selectCafeHubClient)
}
