import React, { useCallback } from 'react'
import Drawer from '$/components/drawers/Drawer'
import ListItem from '$/components/ListItem'
import { Flag } from '$/features/misc/types'
import { useDispatch } from 'react-redux'
import tw from 'twin.macro'
import { MiscAction } from '$/features/misc'
import { Device } from '$/features/cafehub/utils/types'

export default function BLEDrawer() {
    const dispatch = useDispatch()

    const toggle = useCallback((value: boolean) => {
        dispatch(
            MiscAction.setFlag({
                key: Flag.IsBLEDrawerOpen,
                value,
            })
        )
    }, [])

    const devices: Record<string, Device> = {}

    return (
        <Drawer
            openFlag={Flag.IsBLEDrawerOpen}
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
                {Object.entries(devices).map(([mac, device]) => (
                    <li key={mac}>
                        <ListItem
                            id={mac}
                            onClick={() => {
                                // Connect to BLE device.
                                toggle(false)
                            }}
                        >
                            {device.Name}
                        </ListItem>
                    </li>
                ))}
            </ul>
        </Drawer>
    )
}
