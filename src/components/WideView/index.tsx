import React, { HTMLAttributes, ReactNode } from 'react'
import tw from 'twin.macro'
import Clock from '$/components/ui/Clock'
import { css } from '@emotion/react'
import Label from '../primitives/Label'
import PowerToggle from '../ui/PowerToggle'
import StatusIndicator from '../StatusIndicator'
import { useDispatch } from 'react-redux'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import Button from '../primitives/Button'
import Toolbar from '../Toolbar'
import useCafeHubPhaseStatus from '$/hooks/useCafeHubPhaseStatus'
import WaterBar from '$/components/ui/WaterBar'
import useWaterCapacity from '$/hooks/useWaterCapacity'
import useProperty from '$/hooks/useProperty'
import { Property } from '$/features/cafehub/types'
import { useMajorState } from '$/hooks/useMajorState'
import { MajorState } from '$/consts'
import Controller from '$/components/ui/Controller'

function getCapacityInL(capacityInMl: number) {
    return (capacityInMl / 1000).toFixed(1)
}

export default function WideView(props: HTMLAttributes<HTMLDivElement>) {
    const dispatch = useDispatch()

    const connectionStatus = useCafeHubPhaseStatus()

    const capacity = useWaterCapacity()

    const water = useProperty(Property.WaterLevel)

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
                                <span>{getCapacityInL(capacity)}L MAX</span>
                            </>
                        }
                    >
                        <WaterBar />
                    </Pane>
                )}
                <Pane title="Settings">
                    <Button
                        onClick={() => {
                            dispatch(
                                MiscAction.setFlag({
                                    key: Flag.IsSettingsDrawerOpen,
                                    value: true,
                                })
                            )
                        }}
                    >
                        <StatusIndicator value={connectionStatus} />
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
