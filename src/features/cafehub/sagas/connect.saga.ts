import { CafeHubAction } from '$/features/cafehub'
import { MiscAction } from '$/features/misc'
import { selectCafeHubClient } from '$/features/misc/selectors'
import { Flag } from '$/features/misc/types'
import handleError from '$/utils/handleError'
import CafeHubClient from 'cafehub-client'
import { put, select, takeLeading } from 'redux-saga/effects'
import { CafeHubClientEvent, CafeHubClientState } from 'cafehub-client/types'

function* onConnectAction() {
    try {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsCafeHubConnecting,
                value: true,
            })
        )

        const client: CafeHubClient = yield select(selectCafeHubClient)

        const promise = new Promise((resolve: (_?: unknown) => void) => {
            if (client.getState() === CafeHubClientState.Connected) {
                resolve()
                return
            }

            client.once(CafeHubClientEvent.Connect, () => void resolve())
        })

        client.connect()

        yield promise
    } catch (e) {
        handleError(e)
    } finally {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsCafeHubConnecting,
                value: false,
            })
        )
    }
}

export default function* connect() {
    yield takeLeading(CafeHubAction.connect, onConnectAction)
}
