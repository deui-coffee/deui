import { StorageKey, Theme } from '../types'

export default function getTheme(): Theme {
    if (localStorage.getItem(StorageKey.Theme) === Theme.Dark) {
        return Theme.Dark
    }

    return Theme.Light
}
