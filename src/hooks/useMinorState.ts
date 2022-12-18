import { Property } from '$/features/cafehub/types'
import useProperty from '$/hooks/useProperty'

export function useMinorState() {
    return useProperty(Property.MinorState)
}
