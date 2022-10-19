import { State } from '$/types'
import { useSelector } from 'react-redux'

export function selectBackendMachineMAC(state: State) {
    return state.backend.machine.mac
}

export default function useBackendMachineMAC() {
    return useSelector(selectBackendMachineMAC)
}
