import { Flag } from '$/features/misc/types'
import useFlag from '$/hooks/useFlag'

export default function useIsPairing() {
    return useFlag(Flag.IsPairing)
}
