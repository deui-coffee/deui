import { selectModeId } from '$/features/machine/selectors'
import { useSelector } from 'react-redux'

export default function useModeId() {
    return useSelector(selectModeId)
}
