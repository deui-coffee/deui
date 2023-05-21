import { Status } from '$/components/StatusIndicator'
import { useStatus } from '$/stores/data'
import { useEffect } from 'react'

export default function usePreventNavigatingAwayEffect() {
    const status = useStatus()

    useEffect(() => {
        function onUnload(e: BeforeUnloadEvent) {
            if (status !== Status.Off) {
                e.returnValue = true
            }
        }

        window.addEventListener('beforeunload', onUnload)

        return () => {
            window.removeEventListener('beforeunload', onUnload)
        }
    }, [status])
}
