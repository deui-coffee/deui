import { State, Theme } from '$/types'
import { createSelector } from '@reduxjs/toolkit'

function selectSelf(state: State) {
    return state.misc
}

export const selectTheme = createSelector(selectSelf, ({ ui: { dark } }) =>
    dark ? Theme.Dark : Theme.Light
)
