import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Clock from '$/components/ControllerView/Clock'
import { css } from '@emotion/react'
import Label from '../primitives/Label'
import PowerToggle from '../PowerToggle'
import StatusIndicator, { Status } from '../StatusIndicator'
import { useDispatch } from 'react-redux'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import Button from '../primitives/Button'
import Toolbar from '../Toolbar'

export default function WideView(props: HTMLAttributes<HTMLDivElement>) {
    const dispatch = useDispatch()

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
                    <Clock />
                </div>
            </div>
            <Toolbar>
                <Pane />
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
                        <StatusIndicator value={Status.Off} />
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
    title?: string
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