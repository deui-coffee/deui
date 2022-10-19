import { MiscAction } from '$/features/misc'
import { selectBackendClient } from '$/hooks/useBackendClient'
import handleError from '$/utils/handleError'
import takeLeadingFlagged from '$/utils/takeLeadingFlagged'
import CafeHubClient from 'cafehub-client'
import { CafeHubEvent } from 'cafehub-client/types'
import { cancelled, delay, put, select } from 'redux-saga/effects'
import { BackendAction } from '..'

function onError() {
    //
}

function* onConnect({ payload: { url } }: ReturnType<typeof BackendAction.connect>) {
    const client: CafeHubClient = yield select(selectBackendClient)

    try {
        yield put(BackendAction.setUrl(url))

        client.on(CafeHubEvent.Error, onError)

        try {
            yield client.connect(`ws://${url}`, {
                retry: 3,
            })

            yield delay(300)

            yield put(MiscAction.setIsEditingBackendUrl(false))
        } finally {
            client.off(CafeHubEvent.Error, onError)
        }
    } catch (e) {
        handleError(e)
    } finally {
        if ((yield cancelled()) as boolean) {
            client.teardown()
        }
    }
}

export default function* connect() {
    yield takeLeadingFlagged(BackendAction.connect, onConnect, {
        cancellationPattern: BackendAction.abort,
    })
}
