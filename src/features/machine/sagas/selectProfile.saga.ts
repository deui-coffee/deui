import { takeEvery } from 'redux-saga/effects'
import { MachineAction } from '..'
import { StorageKey } from '../../../types'

function onSelectProfileAction({
    payload: profileId,
}: ReturnType<typeof MachineAction.selectProfile>) {
    if (profileId) {
        localStorage.setItem(StorageKey.Profile, profileId)
    } else {
        localStorage.removeItem(StorageKey.Profile)
    }
}

export default function* selectProfile() {
    yield takeEvery(MachineAction.selectProfile, onSelectProfileAction)
}
