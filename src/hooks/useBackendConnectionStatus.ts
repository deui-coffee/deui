import { Status } from '$/components/StatusIndicator'
import { CafeHubState } from 'cafehub-client/types'
import useBackendState from './useBackendState'

export default function useBackendConnectionStatus() {
    switch (useBackendState()) {
        case CafeHubState.Connected:
            return Status.On
        case CafeHubState.Connecting:
            return Status.Busy
        default:
            return Status.Off
    }
}
