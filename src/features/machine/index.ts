import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { StorageKey } from '../../types'
import selectProfile from './sagas/selectProfile.saga'
import { Awake, MachineState } from './types'

export const MachineAction = {
    setAwake: createAction<Awake>('machine: set awake'),
    selectScale: createAction<MachineState['selectedScaleId']>('machine: select scale'),
    selectProfile: createAction<MachineState['selectedProfileId']>('machine: select profile'),
}

const initialState: MachineState = {
    awake: Awake.No,
    scales: [
        { id: 'acaia', label: 'Acaia Lunar' },
        { id: 'wh', label: 'WH-1000XM4' },
        { id: 'de-sc', label: 'Decent scale' },
        { id: 'm.a.p', label: "Matt's Airpods Pro" },
    ],
    selectedScaleId: 'acaia',
    profiles: [
        { id: 'profile#0', label: '7g basket' },
        { id: 'profile#1', label: 'Advanced spring lever' },
        { id: 'profile#2', label: 'Best overall pressure' },
        { id: 'profile#3', label: 'Blooming espresso' },
        { id: 'profile#4', label: 'Classic Italian espresso' },
        { id: 'profile#5', label: 'Cremina lever machine' },
        { id: 'profile#6', label: "Damian's LRV2" },
        { id: 'profile#7', label: 'DefaultE61 espresso machine' },
        { id: 'profile#8', label: 'Gentle & sweet' },
    ],
    selectedProfileId: localStorage.getItem(StorageKey.Profile) || 'profile#2',
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(MachineAction.setAwake, (state, { payload: awake }) => {
        state.awake = awake
    })

    builder.addCase(MachineAction.selectScale, (state, { payload }) => {
        state.selectedScaleId = payload
    })

    builder.addCase(MachineAction.selectProfile, (state, { payload }) => {
        state.selectedProfileId = payload
    })
})

export function* machineSaga() {
    yield all([selectProfile()])
}

export default reducer
