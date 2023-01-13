import { createAction, createReducer } from '@reduxjs/toolkit'
import SettingsView from '../../components/NarrowView/SettingsView'
import MetricsIcon from '../../icons/MetricsIcon'
import ProfilesIcon from '../../icons/ProfilesIcon'
import SettingsIcon from '../../icons/SettingsIcon'
import MetricsView from '../../components/NarrowView/MetricView'
import ProfilesView from '../../components/NarrowView/ProfilesView'
import { View, ViewId, ViewState } from './types'

export const lineup: View[] = [
    {
        id: ViewId.Settings,
        component: SettingsView,
        icon: SettingsIcon,
    },
    {
        id: ViewId.Metrics,
        component: MetricsView,
        icon: MetricsIcon,
    },
    {
        id: ViewId.Profiles,
        component: ProfilesView,
        icon: ProfilesIcon,
    },
]

export const ViewAction = {
    set: createAction<ViewId | 'next' | 'prev'>('view: set'),
}

const initialState: ViewState = {
    viewId: ViewId.Settings,
    index: 0,
}

const reducer = createReducer(initialState, (builder) => {
    builder.addCase(ViewAction.set, (state, { payload }) => {
        const { index } = state

        if (payload === 'next' && index === lineup.length - 1) {
            return
        }

        if (payload === 'prev' && index === 0) {
            return
        }

        const newIndex: number = (() => {
            if (payload === 'next') {
                return index + 1
            }

            if (payload === 'prev') {
                return index - 1
            }

            return lineup.findIndex(({ id }) => id === payload)
        })()

        state.index = newIndex

        state.viewId = lineup[newIndex].id
    })
})

export default reducer
