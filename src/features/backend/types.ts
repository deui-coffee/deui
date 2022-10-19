import CafeHubClient from 'cafehub-client'
import { CafeHubState, ConnectionState } from 'cafehub-client/types'

export interface Machine {
    mac: undefined | string
    connectionState: ConnectionState
}

export interface BackendState {
    url: string
    client: CafeHubClient
    state: CafeHubState
    machine: Machine
}
