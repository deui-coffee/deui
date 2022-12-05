import lifecycle from '$/features/cafehub/sagas/lifecycle.saga'
import { CafeHubState, Phase } from '$/features/cafehub/types'
import CafeHub from '$/features/cafehub/utils/CafeHub'
import parseCharUpdate from '$/features/cafehub/utils/parseCharUpdate'
import { MetricId } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import {
    ConnectionStateUpdate,
    Device,
    GATTNotifyUpdate,
    UpdateMessage,
} from 'cafehub-client/types'
import { all } from 'redux-saga/effects'

function getDefaultMetrics(): Record<MetricId, number> {
    return {
        [MetricId.MetalTemp]: 0,
        [MetricId.Pressure]: 0,
        [MetricId.FlowRate]: 0,
        [MetricId.ShotTime]: 0,
        [MetricId.Weight]: 0,
        [MetricId.WaterLevel]: 0,
        [MetricId.WaterTankCapacity]: 1500, // 1.5L
    }
}

const initialState: CafeHubState = {
    metrics: getDefaultMetrics(),
    phase: Phase.Idle,
}

export const CafeHubAction = {
    connect: createAction<string>('cafehub: connect'),

    open: createAction<CafeHub>('cafehub: open'),

    close: createAction<CloseEvent>('cafehub: close'),

    cancelScan: createAction<CloseEvent>('cafehub: cancel scan'),

    scanComplete: createAction<CloseEvent>('cafehub: scan complete'),

    reScan: createAction<CloseEvent>('cafehub: re-scan'),

    cancelPair: createAction<CloseEvent>('cafehub: cancel pair'),

    pair: createAction('cafehub: pair'),

    error: createAction<Event>('cafehub: error'),

    notification: createAction<GATTNotifyUpdate>('cafehub: notification'),

    device: createAction<Device>('cafehub: device'),

    update: createAction<UpdateMessage>('cafehub: update'),

    connectionState: createAction<ConnectionStateUpdate>('cafehub: new connection state'),

    reset: createAction('cafehub: reset'),

    setPhase: createAction<Phase>('cafehub: set lifecycle phase'),

    write: createAction('cafehub: GATT write'),

    storeUrl: createAction<string>('cafehub: store url'),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(CafeHubAction.notification, (state, { payload: { results } }) => {
        state.metrics = {
            ...state.metrics,
            ...parseCharUpdate(results.Char, results.Data),
        }
    })

    builder.addCase(CafeHubAction.reset, (state) => {
        state.metrics = getDefaultMetrics()
    })

    builder.addCase(CafeHubAction.setPhase, (state, { payload }) => {
        state.phase = payload
    })
})

export default reducer

export function* cafehubSaga() {
    // What if this 'splodes? :boom:
    yield all([lifecycle()])
}
