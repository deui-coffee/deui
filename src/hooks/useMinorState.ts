import { MinorState } from '$/consts'
import { Property } from '$/features/cafehub/types'
import useProperty from '$/hooks/useProperty'

export function useMinorState(): MinorState {
    return useProperty(Property.MinorState) || MinorState.NoState
}
