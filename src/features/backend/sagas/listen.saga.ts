import { BackendAction } from '$/features/backend'
import { selectBackendClient } from '$/hooks/useBackendClient'
import handleError from '$/utils/handleError'
import CafehubClient from 'cafehub-client'
import { RequestCommand } from 'cafehub-client/types'
import { select, takeEvery } from 'redux-saga/effects'

function* onListen({
    payload: { mac: MAC, char: Char, enable: Enable = true },
}: ReturnType<typeof BackendAction.listen>) {
    const client: CafehubClient = yield select(selectBackendClient)

    try {
        yield client.sendRequest({
            command: RequestCommand.GATTSetNotify,
            params: {
                Char,
                Enable,
                MAC,
            },
        })
    } catch (e) {
        handleError(e)
    }
}

export default function* listen() {
    yield takeEvery(BackendAction.listen, onListen)
}
