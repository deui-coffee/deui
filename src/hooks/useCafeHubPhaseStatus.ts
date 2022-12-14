import { Status } from '$/components/StatusIndicator'
import { Phase } from '$/features/cafehub/types'
import useCafeHubPhase from '$/hooks/useCafeHubPhase'

export default function useCafeHubPhaseStatus() {
    switch (useCafeHubPhase()) {
        case Phase.Disconnecting:
        case Phase.Connecting:
        case Phase.Pairing:
        case Phase.Scanning:
            return Status.Busy
        case Phase.Paired:
            return Status.On
        default:
            return Status.Off
    }
}
