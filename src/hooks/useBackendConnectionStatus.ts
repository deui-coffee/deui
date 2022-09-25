import { Status } from '$/components/StatusIndicator'
import { ClientState } from '$/utils/ws-client'
import useBackendState from './useBackendState'

export default function useBackendConnectionStatus() {
    switch (useBackendState()) {
        case ClientState.Connected:
            return Status.On
        case ClientState.Connecting:
            return Status.Busy
        default:
            return Status.Off
    }
}
