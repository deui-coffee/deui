export enum Vendor {
    CafeHub = 'cafehub',
}

export enum BackendStatus {
    Disconnected,
    Connecting,
    Connected,
    Disconnecting,
}

export interface BackendState {
    vendor?: Vendor
    url: string
    status: BackendStatus
}
