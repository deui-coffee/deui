import { createAction, createReducer } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { StorageKey } from '../../types'
import selectProfile from './sagas/selectProfile.saga'
import { Machine, MachineState, ModeId, Power } from './types'

export const MachineAction = {
    setPower: createAction<Power>('machine: set power'),

    selectScale: createAction<MachineState['selectedScaleId']>('machine: select scale'),

    selectProfile: createAction<MachineState['selectedProfileId']>('machine: select profile'),

    setModeId: createAction<ModeId>('machine: set mode id'),

    setConnectedMachine: createAction<undefined | Machine>('machine: set connected machine'),
}

const initialState: MachineState = {
    power: Power.Unknown,
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
    modeId: ModeId.Espresso,
    connectedMachine: undefined,
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(MachineAction.setPower, (state, { payload: power }) => {
        state.power = power
    })

    builder.addCase(MachineAction.selectScale, (state, { payload }) => {
        state.selectedScaleId = payload
    })

    builder.addCase(MachineAction.selectProfile, (state, { payload }) => {
        state.selectedProfileId = payload
    })

    builder.addCase(MachineAction.setModeId, (state, { payload: modeId }) => {
        state.modeId = modeId
    })

    builder.addCase(MachineAction.setConnectedMachine, (state, { payload: connectedMachine }) => {
        state.connectedMachine = connectedMachine
    })
})

export function* machineSaga() {
    yield all([selectProfile()])
}

export default reducer
