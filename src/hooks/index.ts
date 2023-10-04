import { useDataStore } from '$/stores/data'
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
