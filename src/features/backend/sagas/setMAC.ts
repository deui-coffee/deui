import { StorageKey } from '$/types'
import { takeEvery } from 'redux-saga/effects'
import { BackendAction } from '..'

function onSetMAC({ payload }: ReturnType<typeof BackendAction.setMAC>) {
    console.log('setMac', payload)
    if (payload) {
        return void localStorage.setItem(StorageKey.MAC, payload)
    }

    localStorage.removeItem(StorageKey.MAC)
}

export default function* setMAC() {
    yield takeEvery(BackendAction.setMAC, onSetMAC)
}
