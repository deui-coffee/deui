import React from 'react'
import { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import Clock from '$/components/ControllerView/Clock'
import { css } from '@emotion/react'
import Label from './Label'
import PowerToggle from './PowerToggle'
import PaneButton from './PaneButton'
import { Status } from './StatusIndicator'
import { useDispatch } from 'react-redux'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'

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
            <div
                css={[
                    tw`
                        absolute
                        bottom-0
                        left-0
                        w-full
                    `,
                ]}
            >
                <div
                    css={[
                        tw`
                            h-[9rem]
                            w-full
                            flex
                        `,
                    ]}
                >
                    <Pane />
                    <Pane title="Settings">
                        <PaneButton
                            status={Status.Idle}
                            onClick={() => {
                                dispatch(
                                    MiscAction.setFlag({
                                        key: Flag.IsSettingsDrawerOpen,
                                        value: true,
                                    })
                                )
                            }}
                        >
                            Manage
                        </PaneButton>
                    </Pane>
                    <Pane title="Power">
                        <PowerToggle />
                    </Pane>
                </div>
            </div>
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
