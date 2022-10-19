import parseMetricData from '$/utils/parseMetricData'
import { createAction, createReducer } from '@reduxjs/toolkit'
import { MetricId, MetricState } from './types'

export const MetricAction = {
    set: createAction<{ metricId: MetricId; value: undefined | number | string }>('metric: set'),
}

const initialState: MetricState = {
    [MetricId.MetalTemp]: 56,
    [MetricId.Pressure]: 0.0,
    [MetricId.FlowRate]: 0.0,
    [MetricId.ShotTime]: 0.0,
    [MetricId.Weight]: 0.0,
    [MetricId.WaterLevel]: 0,
    [MetricId.WaterTankCapacity]: 1500, // 1.5L
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(MetricAction.set, (state, { payload: { metricId, value } }) => {
        if (typeof value === 'string') {
            state[metricId] = parseMetricData(metricId, value)
            return
        }

        state[metricId] = value
    })
})

export default reducer
