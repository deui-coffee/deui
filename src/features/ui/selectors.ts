import { createSelector } from '@reduxjs/toolkit'
import { State } from '../../types'
import { UiState } from './types'

function selectSelf(state: State): UiState {
    return state.ui
}

export const selectTheme = createSelector(selectSelf, ({ theme }) => theme)
