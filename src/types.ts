export enum View {
    Settings = 'Settings',
    Metrics = 'Metrics',
    Profiles = 'Profile chooser',
}

export type State = {
    view: string | undefined,
}

export enum StoreAction {
    Init,
    NextView,
    PrevView,
    SetView,
}

