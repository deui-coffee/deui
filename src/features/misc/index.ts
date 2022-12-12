import { StorageKey } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { MiscState } from './types'

export const MiscAction = {
    setFlag: createAction<{ key: string; value: boolean }>('misc: set flag'),

    setDarkTheme: createAction<boolean>('misc: set dark theme'),

    setIsEditingBackendUrl: createAction<boolean>('misc: set is editing backend url'),

    setBackendUrl: createAction<string>('misc: set backend url'),

    setTransientBackendUrl: createAction<undefined | string>('misc: set transient backend url'),
}

const initialState: MiscState = {
    flags: {},
    ui: {
        dark: true,
        isEditingBackendUrl: false,
    },
    settings: {
        backendUrl: localStorage.getItem(StorageKey.BackendUrl) || '',
        transientBackendUrl: undefined,
    },
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

        if (!payload) {
            state.settings.transientBackendUrl = undefined
        }
    })

    builder.addCase(MiscAction.setBackendUrl, (state, { payload }) => {
        if (payload) {
            localStorage.setItem(StorageKey.BackendUrl, payload)
        } else {
            localStorage.removeItem(StorageKey.BackendUrl)
        }

        state.settings.backendUrl = payload
    })

    builder.addCase(MiscAction.setTransientBackendUrl, (state, { payload }) => {
        state.settings.transientBackendUrl = payload
    })
})

export function* miscSaga() {
    yield all([])
}

export default reducer
