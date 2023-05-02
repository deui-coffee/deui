import React from 'react'
import 'twin.macro'
import ThemeControl from '../../controls/ThemeControl'
import Control from '$/components/Control'
import mlToL from '$/utils/mlToL'
import WaterBar from '$/components/ui/WaterBar'
import PowerToggle from '$/components/ui/PowerToggle'
import BackendAddressControl from '$/components/controls/BackendAddressControl'
import { useCafeHubStore } from '$/stores/ch'

export default function SettingsView() {
    const { waterCapacity } = useCafeHubStore().machine

    return (
        <div tw="px-14">
            <BackendAddressControl />
            <Control
                label={
                    <>
                        <span>Water tank</span>
                        <span>{mlToL(waterCapacity)}L MAX</span>
                    </>
                }
            >
                <WaterBar />
            </Control>
            <ThemeControl pad fill />
            <Control label="Power" pad fill>
                <PowerToggle />
            </Control>
        </div>
    )
}
