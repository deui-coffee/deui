import { createSelector } from '@reduxjs/toolkit'
import { State } from '../../types'
import { MetricId, MetricState } from './types'

function selectSelf(state: State): MetricState {
    return state.metric
}

export function selectMetric(metricId: MetricId) {
    return createSelector(selectSelf, (substate) => substate[metricId])
}
