import React, { HTMLAttributes } from 'react'
import AwakenessControl from '$/components/SettingsView/AwakenessControl'
import { css } from '@emotion/react'
import tw from 'twin.macro'
import ThemeControl from '$/components/SettingsView/ThemeControl'
import { useAwake } from '$/features/machine/hooks'
import { Awake } from '$/features/machine/types'
import WaterLevelControl from '$/components/SettingsView/WaterLevelControl'
import ScaleControl from '$/components/SettingsView/ScaleControl'
import VisualizerControl from '$/components/SettingsView/VisualizerControl'
import useConnectedMachine from '$/hooks/useConnectedMachine'
import { useDispatch } from 'react-redux'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import useFlag from '$/hooks/useFlag'
import useCafeHubClientState from '$/hooks/useCafeHubClientState'
import { CafeHubClientState } from 'cafehub-client/types'
import { CafeHubAction } from '$/features/cafehub'

export default function Toolbar() {
    const isConnected = Boolean(useConnectedMachine())

    return (
        <div
            css={[
                tw`
                    absolute
                    bottom-0
                    h-[144px]
                    left-0
                    w-full
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        h-full
                        w-full
                        flex
                    `,
                ]}
            >
                {isConnected ? <ConnectedPanes /> : <DisconnectedPanes />}
            </div>
        </div>
    )
}

function DisconnectedPanes() {
    const dispatch = useDispatch()

    const isConnecting = useFlag(Flag.IsCafeHubConnecting)

    const isScanning = useFlag(Flag.IsCafeHubScanning)

    const clientState = useCafeHubClientState()

    if (clientState === CafeHubClientState.Disconnected) {
        return (
            <Pane>
                <button
                    type="button"
                    onClick={() => {
                        dispatch(CafeHubAction.connect())
                    }}
                    tw="text-white bg-[#323232]"
                >
                    Connect to cafehub
                </button>
            </Pane>
        )
    }

    if (isConnecting) {
        return <span tw="text-white">Connecting</span>
    }

    if (isScanning) {
        return <span tw="text-white">Scanning</span>
    }

    return (
        <>
            <Pane>
                <button
                    type="button"
                    onClick={() => {
                        dispatch(
                            MiscAction.setFlag({
                                key: Flag.IsBLEDrawerOpen,
                                value: true,
                            })
                        )

                        dispatch(CafeHubAction.scan())
                    }}
                    tw="text-white bg-[#323232]"
                >
                    Connect machine
                </button>
            </Pane>
        </>
    )
}

function ConnectedPanes() {
    const isOn = useAwake() === Awake.Yes

    return (
        <>
            {isOn ? (
                <>
                    <Pane>
                        <VisualizerControl />
                    </Pane>
                    <Pane>
                        <ScaleControl />
                    </Pane>
                    <Pane>
                        <WaterLevelControl />
                    </Pane>
                </>
            ) : (
                <>
                    <Pane
                        css={[
                            css`
                                flex-basis: 50%;
                            `,
                        ]}
                    />
                    <Pane>
                        <ThemeControl />
                    </Pane>
                </>
            )}
            <Pane>
                <AwakenessControl />
            </Pane>
        </>
    )
}

function Pane({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                css`
                    flex-basis: 25%;

                    :empty {
                        flex-grow: 1;
                    }
                `,
                tw`
                    h-full
                    flex-shrink-0

                    [& + *]:pl-[1px]
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        flex
                        flex-col
                        justify-end
                        bg-[#fafafa]
                        h-full
                        w-full
                        px-6
                        pb-6
                        dark:bg-black
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    )
}
