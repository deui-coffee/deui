import { MiscAction } from '$/features/misc'
import { selectBackendClient } from '$/hooks/useBackendClient'
import handleError from '$/utils/handleError'
import takeLeadingFlagged from '$/utils/takeLeadingFlagged'
import CafeHubClient from 'cafehub-client'
import { delay, put, select } from 'redux-saga/effects'
import { BackendAction } from '..'

function* onDisconnect() {
    try {
        const client: CafeHubClient = yield select(selectBackendClient)

        client.teardown()

        yield delay(300)

        yield put(MiscAction.setIsEditingBackendUrl(false))
    } catch (e) {
        handleError(e)
    }
}

export default function* disconnect() {
    yield takeLeadingFlagged(BackendAction.disconnect, onDisconnect)
}
