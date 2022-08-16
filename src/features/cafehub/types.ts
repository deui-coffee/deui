import type { CafeHubClientState, Device } from 'cafehub-client/types'

export interface CafeHubState {
    clientState: CafeHubClientState
    devices: {
        [mac: string]: Device
    }
}
