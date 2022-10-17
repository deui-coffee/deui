import { put, select, takeLeading } from 'redux-saga/effects'
import { BackendAction } from '..'
import scanUtil from '$/utils/scan'
import CafehubClient from 'cafehub-client'
import { selectBackendClient } from '$/hooks/useBackendClient'
import { Device } from 'cafehub-client/types'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import handleError from '$/utils/handleError'

function* onScan() {
    const client: CafehubClient = yield select(selectBackendClient)

    try {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsScanningForDevices,
                value: true,
            })
        )

        const de1: null | Device = yield scanUtil(client)

        if (de1) {
            yield put(BackendAction.pair(de1.MAC))
        }
    } catch (e) {
        handleError(e)
    } finally {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsScanningForDevices,
                value: false,
            })
        )
    }
}

export default function* scan() {
    yield takeLeading(BackendAction.scan, onScan)
}
