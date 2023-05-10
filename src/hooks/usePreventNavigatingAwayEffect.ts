import { Status } from '$/components/StatusIndicator'
import { useCafeHubStatus } from '$/stores/ch'
import { useEffect } from 'react'

export default function usePreventNavigatingAwayEffect() {
    const status = useCafeHubStatus()

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
