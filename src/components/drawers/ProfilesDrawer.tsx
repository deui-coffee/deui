import React from 'react'
import Drawer, { DrawerProps } from '$/components/drawers/Drawer'
import ListItem from '$/components/ListItem'
import tw from 'twin.macro'
import { profiles } from '$/types'
import { useDataStore } from '$/stores/data'

interface ProfilesDrawerProps extends Pick<DrawerProps, 'onReject'> {
    onResolve?: () => void
}

export default function ProfilesDrawer({ onReject, onResolve }: ProfilesDrawerProps) {
    const { profile: currentProfile, setProfile } = useDataStore()

    return (
        <Drawer
            onReject={onReject}
            css={[
                tw`
                    hidden
                    lg:block
                `,
            ]}
        >
            <ul css={tw`py-20`}>
                {profiles.map((profile) => (
                    <li key={profile.id}>
                        <ListItem
                            id={`${profile.id}`}
                            onClick={() => {
                                setProfile(profile)
                                onResolve?.()
                            }}
                            active={profile === currentProfile}
                        >
                            {profile.name}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
