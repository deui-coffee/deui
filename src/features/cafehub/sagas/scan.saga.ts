import { CafeHubAction } from '$/features/cafehub'
import { MiscAction } from '$/features/misc'
import { selectCafeHubClient } from '$/features/misc/selectors'
import { Flag } from '$/features/misc/types'
import handleError from '$/utils/handleError'
import CafeHubClient from 'cafehub-client'
import { CafeHubClientState, isScanResultUpdate, RequestCommand } from 'cafehub-client/types'
import { put, select, takeLeading } from 'redux-saga/effects'

function* onScanAction() {
    try {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsCafeHubScanning,
                value: true,
            })
        )

        const client: CafeHubClient = yield select(selectCafeHubClient)

        if (client.getState() !== CafeHubClientState.Connected) {
            throw new Error('Not connected')
        }

        yield client.send(
            {
                command: RequestCommand.Scan,
                params: {
                    Timeout: 10,
                },
            },
            {
                onUpdate(message) {
                    // Finish the scan after receiving the last device (it'll have no MAC addr).
                    return isScanResultUpdate(message) && !message.results.MAC
                },
            }
        )
    } catch (e) {
        handleError(e)
    } finally {
        yield put(
            MiscAction.setFlag({
                key: Flag.IsCafeHubScanning,
                value: false,
            })
        )
    }
}

export default function* scan() {
    yield takeLeading(CafeHubAction.scan, onScanAction)
}
