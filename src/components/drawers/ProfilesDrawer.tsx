import React from 'react'
import Drawer from '$/components/drawers/Drawer'
import ListItem from '$/components/ListItem'
import { Flag } from '$/features/misc/types'
import useToggleProfilesDrawer from '$/hooks/useToggleProfilesDrawer'
import tw from 'twin.macro'

export default function ProfilesDrawer() {
    const profiles: unknown[] = []

    const selectedProfileId = undefined // TODO

    const toggle = useToggleProfilesDrawer()

    return (
        <Drawer
            openFlag={Flag.IsProfilesDrawerOpen}
            css={[
                tw`
                    hidden
                    lg:block
                `,
            ]}
        >
            <ul
                css={[
                    tw`
                        py-20
                    `,
                ]}
            >
                {profiles.map((_, id) => (
                    <li key={id}>
                        <ListItem
                            id={`${id}`}
                            onClick={(id) => {
                                throw new Error(`Not implemented, ${id}`)
                                toggle(false)
                            }}
                            active={id === selectedProfileId}
                        >
                            {id}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
