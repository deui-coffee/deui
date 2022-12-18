import { Property } from '$/features/cafehub/types'
import { State } from '$/types'
import { useSelector } from 'react-redux'

function selectProperty(property: Property) {
    return (state: State) => {
        return state.cafehub.machine[property]
    }
}

export default function useProperty(property: Property) {
    return useSelector(selectProperty(property))
}
