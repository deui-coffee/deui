import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { MiscState } from './types'
import CafeHubClient from 'cafehub-client'

const CafeHubWebSockerServerURL = 'ws://192.168.0.15:8765'

export const MiscAction = {
    setFlag: createAction<{ key: string; value: boolean }>('misc: set flag'),

    setDarkTheme: createAction<boolean>('misc: set dark theme'),

    setIsEditingBackendUrl: createAction<boolean>('misc: set is editing backend url'),

    setBackendUrl: createAction<string>('misc: set backend url'),
}

const initialState: MiscState = {
    flags: {},
    ui: {
        dark: true,
        isEditingBackendUrl: false,
    },
    settings: {
        backendUrl: '',
    },
    cafehubClient: new CafeHubClient(CafeHubWebSockerServerURL, {
        autoConnect: false,
    }),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(MiscAction.setFlag, (state, { payload: { key, value } }) => {
        if (value) {
            state.flags[key] = true
        } else {
            delete state.flags[key]
        }
    })

    builder.addCase(MiscAction.setDarkTheme, (state, { payload }) => {
        if (payload) {
            state.ui.dark = true
        } else {
            delete state.ui.dark
        }
    })

    builder.addCase(MiscAction.setIsEditingBackendUrl, (state, { payload }) => {
        state.ui.isEditingBackendUrl = payload
    })

    builder.addCase(MiscAction.setBackendUrl, (state, { payload }) => {
        state.settings.backendUrl = payload
    })
})

export function* miscSaga() {
    yield all([])
}

export default reducer
