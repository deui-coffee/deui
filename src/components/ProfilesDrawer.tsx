import React from 'react'
import Drawer from '$/components/Drawer'
import ListItem from '$/components/ListItem'
import { MachineAction } from '$/features/machine'
import { useProfiles, useSelectedProfileId } from '$/features/machine/hooks'
import { Flag } from '$/features/misc/types'
import { useDispatch } from 'react-redux'
import useToggleProfilesDrawer from '$/hooks/useToggleProfilesDrawer'
import tw from 'twin.macro'

export default function ProfilesDrawer() {
    const profiles = useProfiles()

    const dispatch = useDispatch()

    const selectedProfileId = useSelectedProfileId()

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
                {profiles.map(({ id, label }) => (
                    <li key={id}>
                        <ListItem
                            id={id}
                            onClick={(id) => {
                                dispatch(MachineAction.selectProfile(id))
                                toggle(false)
                            }}
                            active={id === selectedProfileId}
                        >
                            {label}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
