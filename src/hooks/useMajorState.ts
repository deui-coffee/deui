import { MajorState } from '$/consts'
import { Property } from '$/features/cafehub/types'
import useProperty from '$/hooks/useProperty'

export function useMajorState(): MajorState {
    const major = useProperty(Property.MajorState)

    return typeof major === 'undefined' ? MajorState.Unknown : major
}
