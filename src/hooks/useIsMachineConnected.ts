import { State } from '$/types'
import { ConnectionState } from 'cafehub-client/types'
import { useSelector } from 'react-redux'

function selectBackendMachine(state: State) {
    return state.backend.machine
}

export default function useIsMachineConnected() {
    return useSelector(selectBackendMachine).connectionState === ConnectionState.Connected
}
