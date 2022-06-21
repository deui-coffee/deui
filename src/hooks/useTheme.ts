import { selectTheme } from '$/features/misc/selectors'
import { useSelector } from 'react-redux'

export default function useTheme() {
    return useSelector(selectTheme)
}
