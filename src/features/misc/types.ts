import CafeHubClient from 'cafehub-client'

export interface MiscState {
    flags: {
        [key: string]: true
    }
    ui: {
        dark?: true
    }
    cafehubClient: CafeHubClient
}

export enum Flag {
    IsProfilesDrawerOpen = 'is profile drawer open',
    IsBLEDrawerOpen = 'is ble drawer open',
    IsCafeHubConnecting = 'is cafehub connecting',
    IsCafeHubScanning = 'is cafehub scanning',
}
