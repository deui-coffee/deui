import { StorageKey } from '$/types'
import { takeEvery } from 'redux-saga/effects'
import { BackendAction } from '..'

function onUpdateMachine({ payload }: ReturnType<typeof BackendAction.updateMachine>) {
    if ('mac' in payload && payload.mac) {
        return void localStorage.setItem(StorageKey.MAC, payload.mac)
    }

    localStorage.removeItem(StorageKey.MAC)
}

export default function* updateMachine() {
    yield takeEvery(BackendAction.updateMachine, onUpdateMachine)
}
