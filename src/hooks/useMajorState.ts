import { MajorState } from '$/consts'
import { Property } from '$/types'
import { usePropertyValue } from '$/stores/ch'

export function useMajorState(): MajorState {
    return usePropertyValue(Property.MajorState, {
        defaultValue: MajorState.Unknown,
    })
}
