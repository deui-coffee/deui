import { useSelector } from 'react-redux'
import {
    selectProfiles,
    selectScales,
    selectSelectedProfileId,
    selectSelectedScaleId,
} from './selectors'

export function useScales() {
    return useSelector(selectScales)
}

export function useSelectedScaleId() {
    return useSelector(selectSelectedScaleId)
}

export function useProfiles() {
    return useSelector(selectProfiles)
}

export function useSelectedProfileId() {
    return useSelector(selectSelectedProfileId)
}

export function useProfileLabel() {
    const profileId = useSelectedProfileId()

    const profiles = useProfiles()

    return profiles.find(({ id }) => id === profileId)?.label
}
