import Settings from '../../pages/Settings'
import Metrics from '../../pages/Metrics'
import Profiles from '../../pages/Profiles'
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
    component: typeof Settings | typeof Metrics | typeof Profiles
    icon: typeof SettingsIcon | typeof MetricsIcon | typeof ProfilesIcon
}
