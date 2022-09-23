import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { BackendState, BackendStatus, Vendor } from './types'

const initialState: BackendState = {
    vendor: undefined,
    url: '',
    status: BackendStatus.Disconnected,
}

export const BackendAction = {
    setVendor: createAction<Vendor>('backend: set vendor'),

    setUrl: createAction<string>('backend: set url'),

    setStatus: createAction<BackendStatus>('backend: set status'),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(BackendAction.setVendor, (state, { payload }) => {
        state.vendor = payload
    })

    builder.addCase(BackendAction.setUrl, (state, { payload }) => {
        state.url = payload
    })

    builder.addCase(BackendAction.setStatus, (state, { payload }) => {
        state.status = payload
    })
})

export function* backendSaga() {
    yield all([])
}

export default reducer
