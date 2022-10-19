import { put, select, takeLeading } from 'redux-saga/effects'
import { BackendAction } from '..'
import CafehubClient from 'cafehub-client'
import { selectBackendClient } from '$/hooks/useBackendClient'
import { isScanResultUpdate, RequestCommand, UpdateMessage } from 'cafehub-client/types'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import handleError from '$/utils/handleError'
import { selectBackendMachineMAC } from '$/hooks/useBackendMachineMAC'

function* onScan() {
    const client: CafehubClient = yield select(selectBackendClient)

    try {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsScanning,
                value: true,
            })
        )

        const mac: undefined | string = yield select(selectBackendMachineMAC)

        if (mac) {
            yield put(BackendAction.pair(mac))
            return
        }

        const msg: UpdateMessage = yield client.sendRequest(
            {
                command: RequestCommand.Scan,
                params: {
                    Timeout: 10,
                },
            },
            {
                resolveIf(msg) {
                    if (!isScanResultUpdate(msg)) {
                        return false
                    }

                    return !msg.results.MAC || msg.results.Name === 'DE1'
                },
            }
        )

        if (!isScanResultUpdate(msg)) {
            return null
        }

        yield put(BackendAction.pair(msg.results.MAC))
    } catch (e) {
        handleError(e)
    } finally {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsScanning,
                value: false,
            })
        )
    }
}

export default function* scan() {
    yield takeLeading(BackendAction.scan, onScan)
}
