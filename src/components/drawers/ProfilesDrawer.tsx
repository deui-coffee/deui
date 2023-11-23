import React from 'react'
import Drawer, { DrawerProps } from '$/components/drawers/Drawer'
import ListItem from '$/components/ListItem'
import tw from 'twin.macro'
import { useDataStore } from '$/stores/data'
import axios from 'axios'
import { useServerUrl } from '$/hooks'

interface ProfilesDrawerProps extends Pick<DrawerProps, 'onReject'> {
    onResolve?: () => void
}

export default function ProfilesDrawer({ onReject, onResolve }: ProfilesDrawerProps) {
    const {
        profiles,
        remoteState: { profileId },
    } = useDataStore()

    const url = useServerUrl({ protocol: 'http' })

    return (
        <Drawer
            onReject={onReject}
            css={tw`
                hidden
                lg:block
            `}
        >
            <ul css={tw`py-20`}>
                {profiles.map(({ id, title }) => (
                    <li key={id}>
                        <ListItem
                            id={id}
                            onClick={async () => {
                                await axios.post(`${url}/profile-list/${id}`)

                                onResolve?.()
                            }}
                            active={id === profileId}
                        >
                            {title}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
