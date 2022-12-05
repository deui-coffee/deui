import { State, Theme } from '$/types'
import { useSelector } from 'react-redux'

function selectTheme(state: State) {
    return state.misc.ui.dark ? Theme.Dark : Theme.Light
}

export default function useTheme() {
    return useSelector(selectTheme)
}
