import { Property } from '$/features/cafehub/types'
import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectWaterCapacity(state: State) {
    return state.cafehub.machine[Property.WaterCapacity]
}

export default function useWaterCapacity() {
    return useSelector(selectWaterCapacity)
}
