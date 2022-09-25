import CafeHubClient from 'cafehub-client'

export interface MiscState {
    flags: {
        [key: string]: true
    }
    settings: {
        backendUrl: string
    }
    ui: {
        dark?: true
        isEditingBackendUrl: boolean
    }
    cafehubClient: CafeHubClient
}

export enum Flag {
    IsProfilesDrawerOpen = 'is profile drawer open',
    IsBLEDrawerOpen = 'is ble drawer open',
    IsCafeHubConnecting = 'is cafehub connecting',
    IsCafeHubScanning = 'is cafehub scanning',
    IsSettingsDrawerOpen = 'is settings drawer open',
    IsConnectingToBackend = 'is connecting to backend',
    IsDisconnectingToBackend = 'is disconnecting to backend',
}
