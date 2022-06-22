import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { MiscState } from './types'

export const MiscAction = {
    setFlag: createAction<{ key: string; value: boolean }>('misc: set flag'),

    setDarkTheme: createAction<boolean>('misc: set dark theme'),
}

const initialState: MiscState = {
    flags: {},
    ui: {
        dark: true,
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
})

export function* miscSaga() {
    yield all([])
}

export default reducer
