import { useDataStore, useMajorState } from '$/stores/data'
import { useUiStore } from '$/stores/ui'
import { MachineMode, MajorState } from '$/types'
import { useCallback } from 'react'

export function useSetProfileIdCallback() {
    const { setProfileId } = useDataStore()

    return useCallback(
        (id: string) => {
            void (async () => {
                /**
                 * Because we don't have any loading indicator here let's
                 * just make setting the profile id a non-blocking thing.
                 */
                try {
                    await setProfileId(id, { upload: true })
                } catch (e) {
                    console.warn('Failed to set the profile', id)
                }
            })()
        },
        [setProfileId]
    )
}

export function useIsMachineModeActive() {
    const majorState = useMajorState()

    switch (useUiStore().machineMode) {
        case MachineMode.Espresso:
            return majorState === MajorState.Espresso
        case MachineMode.Flush:
            return majorState === MajorState.HotWaterRinse
        case MachineMode.Steam:
            return majorState === MajorState.Steam
        case MachineMode.Water:
            return majorState === MajorState.HotWater
        default:
    }

    return false
}
