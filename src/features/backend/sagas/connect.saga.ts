import { MiscAction } from '$/features/misc'
import { selectBackendClient } from '$/hooks/useBackendClient'
import handleError from '$/utils/handleError'
import takeLeadingFlagged from '$/utils/takeLeadingFlagged'
import WebSocketClient, { EventName } from '$/utils/ws-client'
import { cancelled, delay, put, select } from 'redux-saga/effects'
import { BackendAction } from '..'

function onError() {
    //
}

function* onConnect({ payload: { url } }: ReturnType<typeof BackendAction.connect>) {
    const client: WebSocketClient = yield select(selectBackendClient)

    try {
        yield put(BackendAction.setUrl(url))

        client.on(EventName.Error, onError)

        try {
            yield client.connect(`ws://${url}`, {
                retry: 3,
            })

            yield delay(300)

            yield put(MiscAction.setIsEditingBackendUrl(false))
        } finally {
            client.off(EventName.Error, onError)
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
