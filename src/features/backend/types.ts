import CafeHubClient from 'cafehub-client'

export interface BackendState {
    url: string
    client: CafeHubClient
    mac: undefined | string
}
