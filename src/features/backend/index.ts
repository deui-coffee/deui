import { Flagged, StorageKey } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import CafeHubClient from 'cafehub-client'
import { Device } from 'cafehub-client/types'
import { all } from 'redux-saga/effects'
import connect from './sagas/connect.saga'
import disconnect from './sagas/disconnect.saga'
import pair from './sagas/pair.saga'
import scan from './sagas/scan.saga'
import setMAC from './sagas/setMAC'
import setUrl from './sagas/setUrl.saga'
import { BackendState } from './types'

const initialState: BackendState = {
    url: localStorage.getItem(StorageKey.BackendUrl) || '',
    client: new CafeHubClient(),
    mac: localStorage.getItem(StorageKey.MAC) || undefined,
}

export const BackendAction = {
    setUrl: createAction<string>('backend: set url'),

    connect: createAction<Flagged & { url: string }>('backend: connect'),

    disconnect: createAction<Flagged>('backend: disconnect'),

    abort: createAction('backend: abort'),

    scan: createAction('backend: scan'),

    pair: createAction<string>('backend: pair'),

    setMAC: createAction<undefined | string>('backend: set MAC'),
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

    builder.addCase(BackendAction.setMAC, (state, { payload }) => {
        state.mac = payload
    })
})

export function* backendSaga() {
    yield all([connect(), setUrl(), disconnect(), scan(), pair(), setMAC()])
}

export default reducer
