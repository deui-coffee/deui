import React, { HTMLAttributes, ReactNode } from 'react'
import tw from 'twin.macro'
import Clock from '$/components/ui/Clock'
import { css } from '@emotion/react'
import Label from './primitives/Label'
import PowerToggle from './ui/PowerToggle'
import StatusIndicator from './StatusIndicator'
import Button from './primitives/Button'
import Toolbar from './Toolbar'
import WaterBar from '$/components/ui/WaterBar'
import { Property } from '$/types'
import { useMajorState } from '$/hooks/useMajorState'
import { Layer, MajorState } from '$/consts'
import Controller from '$/components/ui/Controller'
import mlToL from '$/utils/mlToL'
import { toaster } from 'toasterhea'
import SettingsDrawer from './drawers/SettingsDrawer'
import { useCafeHubStatus, useCafeHubStore, usePropertyValue } from '$/stores/ch'

export default function WideView(props: HTMLAttributes<HTMLDivElement>) {
    const status = useCafeHubStatus()

    const { waterCapacity } = useCafeHubStore().machine

    const water = usePropertyValue(Property.WaterLevel)

    const ready = ![MajorState.Unknown, MajorState.Sleep].includes(useMajorState())

    return (
        <div
            {...props}
            css={[
                tw`
                    w-full
                    h-full
                    relative
                    bg-off-white
                    dark:bg-dark-grey
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        h-full
                        pb-[9rem]
                    `,
                ]}
            >
                <div
                    css={[
                        tw`
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-center
                        `,
                    ]}
                >
                    {ready ? <Controller /> : <Clock />}
                </div>
            </div>
            <Toolbar>
                <Pane />
                {typeof water === 'number' && (
                    <Pane
                        title={
                            <>
                                <span>Water</span>
                                <span>{mlToL(waterCapacity)}L MAX</span>
                            </>
                        }
                    >
                        <WaterBar />
                    </Pane>
                )}
                <Pane title="Settings">
                    <Button
                        onClick={async () => {
                            try {
                                await toaster(SettingsDrawer, Layer.Drawer).pop()
                            } catch (e) {
                                // Do nothing.
                            }
                        }}
                    >
                        <StatusIndicator value={status} />
                        Manage
                    </Button>
                </Pane>
                <Pane title="Power">
                    <PowerToggle />
                </Pane>
            </Toolbar>
        </div>
    )
}

type PaneProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
    title?: ReactNode
}

function Pane({ children, title, ...props }: PaneProps) {
    return (
        <div
            {...props}
            css={[
                tw`
                    h-full
                    flex-shrink-0

                    [& + *]:pl-[1px]
                `,
                children
                    ? css`
                          flex-basis: 25%;
                      `
                    : tw`
                        flex-grow
                    `,
            ]}
        >
            <div
                css={[
                    tw`
                        bg-[#fafafa]
                        h-full
                        w-full
                        px-6
                        pb-6
                        dark:bg-black
                    `,
                ]}
            >
                {!!title && (
                    <Label
                        css={[
                            tw`
                                items-center
                                h-[40px]
                            `,
                        ]}
                    >
                        {title}
                    </Label>
                )}
                <div
                    css={[
                        tw`
                            h-20
                        `,
                    ]}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}
