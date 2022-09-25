import { BackendAction } from '$/features/backend'
import { Flag } from '$/features/misc/types'
import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import useBackendUrl from './useBackendUrl'

export default function useAutoConnectEffect() {
    const backendUrl = useBackendUrl()

    const backendUrlRef = useRef(backendUrl)

    useEffect(() => {
        backendUrlRef.current = backendUrl
    }, [backendUrl])

    const dispatch = useDispatch()

    useEffect(() => {
        const { current: url } = backendUrlRef

        if (url) {
            dispatch(
                BackendAction.connect({
                    flag: Flag.IsConnectingToBackend,
                    url,
                })
            )
        }
    }, [])
}
