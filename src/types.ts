import store from './store'

export type State = ReturnType<typeof store.getState>

export enum StorageKey {
    Theme = 'deui/theme',
}
