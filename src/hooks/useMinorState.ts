import { MinorState } from '$/consts'
import { Property } from '$/types'
import { usePropertyValue } from '$/stores/ch'

export function useMinorState(): MinorState {
    return usePropertyValue(Property.MinorState, {
        defaultValue: MinorState.NoState,
    })
}
