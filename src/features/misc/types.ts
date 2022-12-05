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
}

export enum Flag {
    IsProfilesDrawerOpen = 'is profile drawer open',
    IsBLEDrawerOpen = 'is ble drawer open',
    IsScanning = 'is scanning',
    IsSettingsDrawerOpen = 'is settings drawer open',
    IsConnectingToBackend = 'is connecting to backend',
    IsDisconnectingToBackend = 'is disconnecting to backend',
    IsPairing = 'is pairing',
}
