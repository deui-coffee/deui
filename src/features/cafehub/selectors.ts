import { CafeHubState } from '$/features/cafehub/types'
import { State } from '$/types'
import { createSelector } from '@reduxjs/toolkit'

function selectSelf({ cafehub }: State): CafeHubState {
    return cafehub
}

export const selectCafeHubClientState = createSelector(selectSelf, ({ clientState }) => clientState)

export const selectCafeHubDevices = createSelector(selectSelf, ({ devices }) => devices)
