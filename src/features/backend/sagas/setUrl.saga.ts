import { StorageKey } from '$/types'
import { takeEvery } from 'redux-saga/effects'
import { BackendAction } from '..'

function onSetUrl({ payload }: ReturnType<typeof BackendAction.setUrl>) {
    localStorage.setItem(StorageKey.BackendUrl, payload)
}

export default function* setUrl() {
    yield takeEvery(BackendAction.setUrl, onSetUrl)
}
