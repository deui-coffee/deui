import { Machine } from '$/features/backend/types'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import { selectBackendClient } from '$/hooks/useBackendClient'
import handleError from '$/utils/handleError'
import CafehubClient from 'cafehub-client'
import {
    RequestCommand,
    UpdateMessage,
    isConnectionStateUpdate,
    ConnectionState,
    CharAddr,
} from 'cafehub-client/types'
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

        if (!isConnectionStateUpdate(msg)) {
            return
        }

        const machine: Machine = {
            mac: MAC,
            connectionState: msg.results.CState,
        }

        yield put(BackendAction.updateMachine(machine))

        if (machine.connectionState !== ConnectionState.Connected) {
            return
        }

        yield put(
            BackendAction.listen({
                mac: MAC,
                char: CharAddr.WaterLevels,
            })
        )

        yield put(
            BackendAction.listen({
                mac: MAC,
                char: CharAddr.Temperatures,
            })
        )
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
