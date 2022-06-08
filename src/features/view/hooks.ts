import { useSelector } from 'react-redux'
import { selectViewId, selectViewIndex } from './selectors'

export function useViewId() {
    return useSelector(selectViewId)
}

export function useViewIndex() {
    return useSelector(selectViewIndex)
}
