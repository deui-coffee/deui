import { createSelector } from '@reduxjs/toolkit'
import { State } from '../../types'
import { MachineState } from './types'

function selectSelf(state: State): MachineState {
    return state.machine
}

export const selectAwake = createSelector(selectSelf, ({ awake }) => awake)
