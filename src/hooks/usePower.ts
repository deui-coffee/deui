import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectPower(state: State) {
    return state.machine.power
}

export default function usePower() {
    return useSelector(selectPower)
}
