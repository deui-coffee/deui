import { useSelector } from 'react-redux'
import { selectTheme } from './selectors'

export function useTheme() {
    return useSelector(selectTheme)
}
