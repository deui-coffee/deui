import lifecycle from '$/features/cafehub/sagas/lifecycle.saga'
import { CafeHubState, Machine, Phase } from '$/features/cafehub/types'
import CafeHub from '$/features/cafehub/utils/CafeHub'
import { StorageKey } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import {
    CharAddr,
    ConnectionStateUpdate,
    Device,
    ErrorUpdate,
    UpdateMessage,
} from 'cafehub-client/types'
import { all } from 'redux-saga/effects'

function getDefaultMachine(): Machine {
    return {}
}

const initialState: CafeHubState = {
    machine: getDefaultMachine(),
    phase: Phase.Disconnected,
    recentMAC: localStorage.getItem(StorageKey.RecentMAC) || undefined,
}

export const CafeHubAction = {
    connect: createAction<string>('cafehub: connect'),

    open: createAction<CafeHub>('cafehub: open'),

    close: createAction<null | CloseEvent>('cafehub: close'),

    abort: createAction('cafehub: abort'),

    aborted: createAction<Phase>('cafehub: aborted'),

    scanComplete: createAction('cafehub: scan complete'),

    scanFailed: createAction('cafehub: scan failed'),

    scan: createAction('cafehub: scan'),

    pair: createAction('cafehub: pair'),

    unpair: createAction('cafehub: unpair'),

    error: createAction<Event>('cafehub: error'),

    device: createAction<Device>('cafehub: device'),

    update: createAction<UpdateMessage>('cafehub: update'),

    connectionState: createAction<ConnectionStateUpdate>('cafehub: new connection state'),

    execError: createAction<ErrorUpdate>('cafehub: exec error'),

    setPhase: createAction<Phase>('cafehub: set lifecycle phase'),

    write: createAction<{
        char: CharAddr
        data: Buffer
    }>('cafehub: GATT write'),

    storeUrl: createAction<string>('cafehub: store url'),

    setRecentMAC: createAction<string | undefined>('cafehub: set recent mac'),

    updateMachine: createAction<Machine>('cafehub: update machine'),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(CafeHubAction.setPhase, (state, { payload }) => {
        state.phase = payload

        if (payload !== Phase.Connected) {
            state.machine = getDefaultMachine()
        }
    })

    builder.addCase(CafeHubAction.setRecentMAC, (state, { payload }) => {
        if (payload) {
            localStorage.setItem(StorageKey.RecentMAC, payload)
        } else {
            localStorage.removeItem(StorageKey.RecentMAC)
        }

        state.recentMAC = payload
    })

    builder.addCase(CafeHubAction.updateMachine, (state, { payload }) => {
        state.machine = {
            ...state.machine,
            ...payload,
        }
    })
})

export default reducer

export function* cafehubSaga() {
    // What if this 'splodes? :boom:
    yield all([lifecycle()])
}
