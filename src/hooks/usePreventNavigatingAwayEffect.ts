import { Phase } from '$/features/cafehub/types'
import useCafeHubPhase from '$/hooks/useCafeHubPhase'
import { useEffect } from 'react'

export default function usePreventNavigatingAwayEffect() {
    const chPhase = useCafeHubPhase()

    useEffect(() => {
        if (chPhase === Phase.Disconnected) {
            return () => {
                //
            }
        }

        function onUnload(e: BeforeUnloadEvent) {
            e.returnValue = true
        }

        window.addEventListener('beforeunload', onUnload)

        return () => {
            window.removeEventListener('beforeunload', onUnload)
        }
    }, [chPhase])
}
