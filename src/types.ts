import SettingsView from '$/components/NarrowView/SettingsView'
import MetricsView from '$/components/NarrowView/MetricsView'
import ProfilesView from '$/components/NarrowView/ProfilesView'
import { SettingsIcon } from '$/icons'
import { MetricsIcon } from '$/icons'
import { ProfilesIcon } from '$/icons'
import { ViewId } from '$/shared/types'

export interface View {
    id: ViewId
    component: typeof SettingsView | typeof MetricsView | typeof ProfilesView
    icon: typeof SettingsIcon | typeof MetricsIcon | typeof ProfilesIcon
}
