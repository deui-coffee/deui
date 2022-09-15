import { createSelector } from '@reduxjs/toolkit'
import { State } from '../../types'
import { MachineState } from './types'

function selectSelf(state: State): MachineState {
    return state.machine
}

export const selectScales = createSelector(selectSelf, ({ scales }) => scales)

export const selectSelectedScaleId = createSelector(
    selectSelf,
    ({ selectedScaleId }) => selectedScaleId
)

export const selectProfiles = createSelector(selectSelf, ({ profiles }) => profiles)

export const selectSelectedProfileId = createSelector(
    selectSelf,
    ({ selectedProfileId }) => selectedProfileId
)

export const selectModeId = createSelector(selectSelf, ({ modeId }) => modeId)

export const selectConnectedMachine = createSelector(
    selectSelf,
    ({ connectedMachine }) => connectedMachine
)
