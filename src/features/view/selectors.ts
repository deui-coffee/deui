import { createSelector } from '@reduxjs/toolkit'
import { State } from '../../types'
import { ViewState } from './types'

function selectSelf(state: State): ViewState {
    return state.view
}

export const selectViewId = createSelector(selectSelf, ({ viewId }) => viewId)

export const selectViewIndex = createSelector(selectSelf, ({ index }) => index)
