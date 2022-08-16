import { selectCafeHubDevices } from '$/features/cafehub/selectors'
import { useSelector } from 'react-redux'

export default function useCafeHubDevices() {
    return useSelector(selectCafeHubDevices)
}
