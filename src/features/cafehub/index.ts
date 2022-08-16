import connect from '$/features/cafehub/sagas/connect.saga'
import scan from '$/features/cafehub/sagas/scan.saga'
import { CafeHubState } from '$/features/cafehub/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import { CafeHubClientState, Device } from 'cafehub-client/types'
import { all } from 'redux-saga/effects'

export const CafeHubAction = {
    connect: createAction('cafehub: connect'),

    scan: createAction('cafehub: scan'),

    setClientState: createAction<CafeHubClientState>('cafehub: set client state'),

    storeDevice: createAction<Device>('cafehub: store device'),
}

const initialState: CafeHubState = {
    clientState: CafeHubClientState.Disconnected,
    devices: {},
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(CafeHubAction.setClientState, (state, { payload: clientState }) => {
        state.clientState = clientState
    })

    builder.addCase(CafeHubAction.storeDevice, (state, { payload: device }) => {
        state.devices[device.MAC] = device
    })
})

export function* cafehubSaga() {
    yield all([connect(), scan()])
}

export default reducer
