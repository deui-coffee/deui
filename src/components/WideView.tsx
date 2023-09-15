import Clock from '$/components/ui/Clock'
import Controller from '$/components/ui/Controller'
import WaterBar from '$/components/ui/WaterBar'
import { Layer } from '$/types'
import { useDataStore, useMajorState, useWaterLevel } from '$/stores/data'
import { Prop } from '$/types'
import mlToL from '$/utils/mlToL'
import React, { HTMLAttributes, ReactNode } from 'react'
import { toaster } from 'toasterhea'
import tw from 'twin.macro'
import Toolbar from './Toolbar'
import SettingsDrawer from './drawers/SettingsDrawer'
import Button from './primitives/Button'
import Label from './primitives/Label'
import PowerToggle from './ui/PowerToggle'

const settingsDrawer = toaster(SettingsDrawer, Layer.Drawer)

export default function WideView(props: HTMLAttributes<HTMLDivElement>) {
    const { [Prop.WaterCapacity]: waterCapacity = 0 } = useDataStore().properties

    const ready = true // typeof majorState !== 'undefined' && majorState !== MajorState.Sleep

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
                <Pane title="Settings">
                    <Button
                        onClick={async () => {
                            try {
                                await settingsDrawer.pop()
                            } catch (e) {
                                // Do nothing.
                            }
                        }}
                    >
                        Edit
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
        <div {...props} css={tw`h-full`}>
            <div
                css={tw`
                    bg-[#fafafa]
                    dark:bg-black
                    h-full
                    w-full
                    px-6
                    pb-6
                `}
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
