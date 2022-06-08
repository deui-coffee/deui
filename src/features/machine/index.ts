import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { Awake, MachineState } from './types'

export const MachineAction = {
    setAwake: createAction<Awake>('machine: set awake'),
}

const initialState: MachineState = {
    // @TODO we may want to determine the value before showing the UI.
    awake: Awake.Yes,
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(MachineAction.setAwake, (state, { payload: awake }) => {
        state.awake = awake
    })
})

export function* machineSaga() {
    yield all([])
}

export default reducer
