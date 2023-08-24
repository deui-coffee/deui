import React from 'react'
import Drawer, { DrawerProps } from '$/components/drawers/Drawer'
import ListItem from '$/components/ListItem'
import tw from 'twin.macro'
import { profiles as allProfiles } from '$/types'
import { useDataStore } from '$/stores/data'

interface ProfilesDrawerProps extends Pick<DrawerProps, 'onReject'> {
    onResolve?: () => void
}

export default function ProfilesDrawer({ onReject, onResolve }: ProfilesDrawerProps) {
    const { profile, setProfileId } = useDataStore()

    const profiles = allProfiles.filter(({ visible }) => visible)

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
                {profiles.map(({ id, name }) => (
                    <li key={id}>
                        <ListItem
                            id={id}
                            onClick={() => {
                                setTimeout(async () => {
                                    /**
                                     * Because we don't have any loading indicator here let's
                                     * just make setting the profile id a non-blocking thing.
                                     */
                                    try {
                                        await setProfileId(id, { upload: true })
                                    } catch (e) {
                                        console.warn('Failed to set the profile', id)
                                    }
                                })

                                onResolve?.()
                            }}
                            active={id === profile?.id}
                        >
                            {name}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
