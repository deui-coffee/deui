import { useSelector } from 'react-redux'
import { selectAwake } from './selectors'

export function useAwake() {
    return useSelector(selectAwake)
}
