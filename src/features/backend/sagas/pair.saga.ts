import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import { selectBackendClient } from '$/hooks/useBackendClient'
import handleError from '$/utils/handleError'
import CafehubClient from 'cafehub-client'
import { RequestCommand, UpdateMessage } from 'cafehub-client/types'
import { put, select, takeLeading } from 'redux-saga/effects'
import { BackendAction } from '..'

function* onPair({ payload: MAC }: ReturnType<typeof BackendAction.pair>) {
    const client: CafehubClient = yield select(selectBackendClient)

    try {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsPairing,
                value: true,
            })
        )

        const msg: UpdateMessage = yield client.sendRequest({
            command: RequestCommand.GATTConnect,
            params: {
                MAC,
            },
        })

        yield put(BackendAction.setMAC(MAC))

        console.log('Paired', msg)
    } catch (e) {
        handleError(e)
    } finally {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsPairing,
                value: false,
            })
        )
    }
}

export default function* pair() {
    yield takeLeading(BackendAction.pair, onPair)
}
