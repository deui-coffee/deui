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
    const { profileManifest: currentProfileManifest, setProfileManifest } = useDataStore()

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
                {profiles.map((profileManifest) => (
                    <li key={profileManifest.id}>
                        <ListItem
                            id={`${profileManifest.id}`}
                            onClick={() => {
                                setProfileManifest(profileManifest)
                                onResolve?.()
                            }}
                            active={profileManifest.id === currentProfileManifest?.id}
                        >
                            {profileManifest.name}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
