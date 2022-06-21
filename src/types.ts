import store from './store'

export type State = ReturnType<typeof store.getState>

export enum StorageKey {
    Theme = 'deui/theme',
    Profile = 'deui/profile',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}
