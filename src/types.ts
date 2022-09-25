import store from './store'

export type State = ReturnType<typeof store.getState>

export enum StorageKey {
    Theme = 'deui/theme',
    Profile = 'deui/profile',
    BackendUrl = 'deui/backendUrl',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export interface Flagged {
    flag: string
}
