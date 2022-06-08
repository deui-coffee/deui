import { takeEvery } from 'redux-saga/effects'
import { UiAction } from '..'
import { StorageKey } from '../../../types'
import handleError from '../../../utils/handleError'
import { Theme } from '../types'

function onSetThemeAction({ payload: theme }: ReturnType<typeof UiAction.setTheme>) {
    try {
        switch (theme) {
            case Theme.Light:
            case Theme.Dark:
                localStorage.setItem(StorageKey.Theme, theme)
                break
            default:
                localStorage.removeItem(StorageKey.Theme)
        }
    } catch (e) {
        handleError(e)
    }
}

export default function* setTheme() {
    yield takeEvery(UiAction.setTheme, onSetThemeAction)
}
