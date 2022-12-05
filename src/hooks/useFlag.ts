import { State } from '$/types'
import { useSelector } from 'react-redux'

export function selectFlag(key: string) {
    return (state: State) => Boolean(state.misc.flags[key])
}

export default function useFlag(key: string): boolean {
    return useSelector(selectFlag(key))
}
