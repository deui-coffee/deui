import SettingsView from '../../components/NarrowView/SettingsView'
import MetricsView from '../../components/NarrowView/MetricView'
import ProfilesView from '../../components/NarrowView/ProfilesView'
import SettingsIcon from '../../icons/SettingsIcon'
import MetricsIcon from '../../icons/MetricsIcon'
import ProfilesIcon from '../../icons/ProfilesIcon'

export enum ViewId {
    Settings = 'settings',
    Metrics = 'metrics',
    Profiles = 'profiles',
}

export interface ViewState {
    viewId: ViewId
    index: number
}

export interface View {
    id: ViewId
    component: typeof SettingsView | typeof MetricsView | typeof ProfilesView
    icon: typeof SettingsIcon | typeof MetricsIcon | typeof ProfilesIcon
}
