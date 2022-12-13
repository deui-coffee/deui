import lifecycle from '$/features/cafehub/sagas/lifecycle.saga'
import { CafeHubState, Phase } from '$/features/cafehub/types'
import CafeHub from '$/features/cafehub/utils/CafeHub'
import parseCharUpdate from '$/features/cafehub/utils/parseCharUpdate'
import { MetricId } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import {
    ConnectionStateUpdate,
    Device,
    ErrorUpdate,
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
    phase: Phase.Disconnected,
}

export const CafeHubAction = {
    connect: createAction<string>('cafehub: connect'),

    open: createAction<CafeHub>('cafehub: open'),

    close: createAction<null | CloseEvent>('cafehub: close'),

    abort: createAction('cafehub: abort'),

    aborted: createAction<Phase>('cafehub: aborted'),

    scanComplete: createAction('cafehub: scan complete'),

    scanFailed: createAction('cafehub: scan failed'),

    scan: createAction('cafehub: scan'),

    pair: createAction('cafehub: pair'),

    unpair: createAction('cafehub: unpair'),

    error: createAction<Event>('cafehub: error'),

    notification: createAction<GATTNotifyUpdate>('cafehub: notification'),

    device: createAction<Device>('cafehub: device'),

    update: createAction<UpdateMessage>('cafehub: update'),

    connectionState: createAction<ConnectionStateUpdate>('cafehub: new connection state'),

    execError: createAction<ErrorUpdate>('cafehub: exec error'),

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
