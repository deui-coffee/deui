import React from 'react'
import Drawer, { DrawerProps } from '$/components/drawers/Drawer'
import ListItem from '$/components/ListItem'
import tw from 'twin.macro'
import { profiles as allProfiles } from '$/types'
import { useDataStore } from '$/stores/data'
import { getVisibleProfiles } from '$/utils'
import { useSetProfileIdCallback } from '$/hooks'

interface ProfilesDrawerProps extends Pick<DrawerProps, 'onReject'> {
    onResolve?: () => void
}

const profiles = getVisibleProfiles()

export default function ProfilesDrawer({ onReject, onResolve }: ProfilesDrawerProps) {
    const { profile } = useDataStore()

    const setProfileId = useSetProfileIdCallback()

    return (
        <Drawer
            onReject={onReject}
            css={tw`
                hidden
                lg:block
            `}
        >
            <ul css={tw`py-20`}>
                {profiles.map(({ id, name }) => (
                    <li key={id}>
                        <ListItem
                            id={id}
                            onClick={() => {
                                setProfileId(id)

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
