import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import getTheme from '../../utils/getTheme'
import setTheme from './sagas/setTheme.saga'
import { Theme, UiState } from './types'

export const UiAction = {
    setTheme: createAction<Theme>('ui: set theme'),
}

const initialState: UiState = {
    theme: getTheme(),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(UiAction.setTheme, (state, { payload: theme }) => {
        state.theme = theme
    })
})

export function* uiSaga() {
    yield all([setTheme()])
}

export default reducer
