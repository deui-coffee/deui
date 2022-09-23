import React from 'react'
import Drawer, { DrawerHeader } from '$/components/drawers/Drawer'
import { Flag } from '$/features/misc/types'
import tw from 'twin.macro'
import ThemeControl from '../SettingsView/ThemeControl'
import ScaleControl from '../SettingsView/ScaleControl'
import BackendAddressControl from '../controls/BackendAddressControl'
import useIsEditingBackendUrl from '$/hooks/useIsEditingBackendUrl'

export default function SettingsDrawer() {
    const isEditingBackendUrl = useIsEditingBackendUrl()

    return (
        <Drawer
            openFlag={Flag.IsSettingsDrawerOpen}
            css={[
                tw`
                    hidden
                    lg:block
                `,
            ]}
        >
            <DrawerHeader title="Settings" />
            <div
                css={[
                    tw`
                        px-14
                    `,
                ]}
            >
                <BackendAddressControl fill />
                {!isEditingBackendUrl && (
                    <>
                        <ScaleControl fill pad />
                        <ThemeControl fill pad />
                    </>
                )}
            </div>
        </Drawer>
    )
}
