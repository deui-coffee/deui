import { selectFlag } from '$/features/misc/selectors'
import { useSelector } from 'react-redux'

export default function useFlag(key: string): boolean {
    return useSelector(selectFlag(key))
}
