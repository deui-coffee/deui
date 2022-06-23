import { StorageKey, Theme } from '../types'

export default function getTheme(): Theme {
    const theme = localStorage.getItem(StorageKey.Theme)

    switch (theme) {
        case Theme.Light:
        case Theme.Dark:
            return theme
        default:
            return Theme.Light
    }
}
