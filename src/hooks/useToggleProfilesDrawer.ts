import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

export default function useToggleProfilesDrawer() {
    const dispatch = useDispatch()

    return useCallback((value: boolean) => {
        dispatch(
            MiscAction.setFlag({
                key: Flag.IsProfilesDrawerOpen,
                value,
            })
        )
    }, [])
}
