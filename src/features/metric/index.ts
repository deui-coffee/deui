import { createAction, createReducer } from '@reduxjs/toolkit'
import { MetricId, MetricState } from './types'

export const MetricAction = {
    set: createAction<{ metricId: MetricId; value: undefined | number }>('metric: set'),
}

const initialState: MetricState = {
    [MetricId.MetalTemp]: 56,
    [MetricId.Pressure]: 0.0,
    [MetricId.FlowRate]: 0.0,
    [MetricId.ShotTime]: 0.0,
    [MetricId.Weight]: 0.0,
    [MetricId.WaterLevel]: 672,
    [MetricId.WaterTankCapacity]: 1400,
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(MetricAction.set, (state, { payload: { metricId, value } }) => {
        state[metricId] = value
    })
})

export default reducer
