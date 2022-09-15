import React from 'react'
import Drawer, { DrawerHeader } from '$/components/Drawer'
import { Flag } from '$/features/misc/types'
import tw from 'twin.macro'
import ThemeControl from './SettingsView/ThemeControl'
import ScaleControl from './SettingsView/ScaleControl'

export default function SettingsDrawer() {
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
                <ScaleControl fill pad />
                <ThemeControl fill pad />
            </div>
        </Drawer>
    )
}
