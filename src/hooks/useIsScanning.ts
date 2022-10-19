import { Flag } from '$/features/misc/types'
import useFlag from '$/hooks/useFlag'

export default function useIsScanning() {
    return useFlag(Flag.IsScanning)
}
