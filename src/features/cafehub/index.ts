import lifecycle from '$/features/cafehub/sagas/lifecycle.saga'
import { CafeHubState, Machine, Phase, Property, Shot } from '$/features/cafehub/types'
import CafeHub from '$/features/cafehub/utils/CafeHub'
import parseChar from '$/features/cafehub/utils/parseChar'
import parseShotFrame from '$/features/cafehub/utils/parseShotFrame'
import parseShotHeader from '$/features/cafehub/utils/parseShotHeader'
import { StorageKey } from '$/types'
import { createAction, createReducer } from '@reduxjs/toolkit'
import {
    CharAddr,
    ConnectionStateUpdate,
    Device,
    ErrorUpdate,
    UpdateMessage,
} from '$/features/cafehub/utils/types'
import { all } from 'redux-saga/effects'

function getDefaultMachine(): Machine {
    return {
        [Property.WaterCapacity]: 1500,
    }
}

function getDefaultShot(): Shot {
    return {
        header: {
            HeaderV: 1,
            NumberOfFrames: 0,
            NumberOfPreinfuseFrames: 0,
            MinimumPressure: 0,
            MaximumFlow: 0,
        },
        frames: [],
    }
}

const initialState: CafeHubState = {
    machine: getDefaultMachine(),
    shot: getDefaultShot(),
    phase: Phase.Disconnected,
    recentMAC: localStorage.getItem(StorageKey.RecentMAC) || undefined,
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

    device: createAction<Device>('cafehub: device'),

    update: createAction<UpdateMessage>('cafehub: update'),

    connectionState: createAction<ConnectionStateUpdate>('cafehub: new connection state'),

    execError: createAction<ErrorUpdate>('cafehub: exec error'),

    setPhase: createAction<Phase>('cafehub: set lifecycle phase'),

    write: createAction<{
        char: CharAddr
        data: Buffer
    }>('cafehub: GATT write'),

    storeUrl: createAction<string>('cafehub: store url'),

    setRecentMAC: createAction<string | undefined>('cafehub: set recent mac'),

    updateMachine: createAction<Machine>('cafehub: update machine'),

    store: createAction<{
        char: CharAddr
        data: string
    }>('cafehub: store'),

    raw: createAction<Record<string, unknown>>('cafehub: raw'),
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(CafeHubAction.setPhase, (state, { payload }) => {
        state.phase = payload

        if ([Phase.Unpaired, Phase.Disconnected].includes(payload)) {
            state.machine = getDefaultMachine()

            state.shot = getDefaultShot()
        }
    })

    builder.addCase(CafeHubAction.setRecentMAC, (state, { payload }) => {
        if (payload) {
            localStorage.setItem(StorageKey.RecentMAC, payload)
        } else {
            localStorage.removeItem(StorageKey.RecentMAC)
        }

        state.recentMAC = payload
    })

    builder.addCase(CafeHubAction.store, (state, { payload: { char, data } }) => {
        switch (char) {
            case CharAddr.HeaderWrite:
                state.shot.header = parseShotHeader(data)
                break
            case CharAddr.FrameWrite:
                state.shot.frames = parseShotFrame(state.shot.frames, data)
                break
            case undefined:
                break
            default:
                state.machine = {
                    ...state.machine,
                    ...parseChar(char, data),
                }
        }
    })
})

export default reducer

export function* cafehubSaga() {
    // What if this 'splodes? :boom:
    yield all([lifecycle()])
}
