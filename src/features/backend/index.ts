import { Flagged, StorageKey } from '$/types'
import WebSocketClient from '$/utils/ws-client'
import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import connect from './sagas/connect.saga'
import disconnect from './sagas/disconnect.saga'
import setUrl from './sagas/setUrl.saga'
import { BackendState } from './types'

const initialState: BackendState = {
    url: localStorage.getItem(StorageKey.BackendUrl) || '',
    client: new WebSocketClient(),
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.c = initialState.client

export const BackendAction = {
    setUrl: createAction<string>('backend: set url'),

    connect: createAction<Flagged & { url: string }>('backend: connect'),

    disconnect: createAction<Flagged>('backend: disconnect'),

    abort: createAction('backend: abort'),
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
})

export function* backendSaga() {
    yield all([connect(), setUrl(), disconnect()])
}

export default reducer
