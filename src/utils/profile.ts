import { Profile, StorageKey, isRawProfile } from '$/types'
import axios from 'axios'

export async function getProfile(profileId: string): Promise<Profile | undefined> {
    const { data: rawProfile } = await axios.get(`/profiles/${profileId}.json`)

    if (!isRawProfile(rawProfile)) {
        throw new Error(`Invalid profile`)
    }

    return {
        ...rawProfile,
        id: profileId,
    }
}

export async function getLastKnownProfile(): Promise<Profile | undefined> {
    const profileId = localStorage.getItem(StorageKey.Profile)

    if (!profileId) {
        return
    }

    return getProfile(profileId)
}

export function storeProfileId(profileId: string | undefined) {
    if (!profileId) {
        return void localStorage.removeItem(StorageKey.Profile)
    }

    localStorage.setItem(StorageKey.Profile, profileId)
}
