import { State } from '$/types'

export default function selectCafeHubRecentMAC(state: State) {
    return state.cafehub.recentMAC
}
