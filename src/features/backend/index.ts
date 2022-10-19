import { Flagged, StorageKey } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import CafeHubClient from 'cafehub-client'
import { CafeHubState, CharAddr, ConnectionState } from 'cafehub-client/types'
import { all } from 'redux-saga/effects'
import connect from './sagas/connect.saga'
import disconnect from './sagas/disconnect.saga'
import pair from './sagas/pair.saga'
import scan from './sagas/scan.saga'
import listen from './sagas/listen.saga'
import updateMachine from './sagas/updateMachine'
import setUrl from './sagas/setUrl.saga'
import { BackendState, Machine } from './types'

const client = new CafeHubClient()

const initialState: BackendState = {
    url: localStorage.getItem(StorageKey.BackendUrl) || '',
    client,
    state: client.getState(),
    machine: {
        mac: localStorage.getItem(StorageKey.MAC) || undefined,
        connectionState: ConnectionState.Disconnected,
    },
}

export const BackendAction = {
    setUrl: createAction<string>('backend: set url'),

    connect: createAction<Flagged & { url: string }>('backend: connect'),

    disconnect: createAction<Flagged>('backend: disconnect'),

    abort: createAction('backend: abort'),

    scan: createAction('backend: scan'),

    pair: createAction<string>('backend: pair'),

    updateMachine: createAction<Partial<Machine>>('backend: update machine'),

    setState: createAction<CafeHubState>('backend: set state'),

    listen: createAction<{
        char: CharAddr
        mac: string
        enable?: boolean
    }>('backend: listen'),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(BackendAction.setUrl, (state, { payload }) => {
        state.url = payload
    })

    builder.addCase(BackendAction.connect, () => {
        // Saga.
    })

    builder.addCase(BackendAction.disconnect, () => {
        // Saga.
    })

    builder.addCase(BackendAction.abort, () => {
        // Noop.
    })

    builder.addCase(BackendAction.scan, () => {
        // Saga.
    })

    builder.addCase(BackendAction.pair, () => {
        // Saga.
    })

    builder.addCase(BackendAction.listen, () => {
        // Saga.
    })

    builder.addCase(BackendAction.updateMachine, (state, { payload }) => {
        state.machine = {
            ...state.machine,
            ...payload,
        }
    })

    builder.addCase(BackendAction.setState, (state, { payload }) => {
        state.state = payload
    })
})

export function* backendSaga() {
    yield all([connect(), setUrl(), disconnect(), scan(), pair(), updateMachine(), listen()])
}

export default reducer
