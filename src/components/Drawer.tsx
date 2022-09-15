import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import useFlag from '$/hooks/useFlag'
import { css } from '@emotion/react'
import React, { HTMLAttributes, useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import tw from 'twin.macro'

type Props = HTMLAttributes<HTMLDivElement> & {
    openFlag: Flag
}

export default function Drawer({ openFlag, children, ...props }: Props) {
    const open = useFlag(openFlag)

    const dispatch = useDispatch()

    const toggle = useCallback(
        (value: boolean) => {
            dispatch(
                MiscAction.setFlag({
                    key: openFlag,
                    value,
                })
            )
        },
        [openFlag]
    )

    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) {
            return () => {
                // Noop.
            }
        }

        function onEvent(e: MouseEvent | TouchEvent) {
            if (!bodyRef.current || bodyRef.current.contains(e.target as Element)) {
                return
            }

            toggle(false)
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                toggle(false)
            }
        }

        document.addEventListener('mousedown', onEvent)

        document.addEventListener('touchstart', onEvent)

        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('mousedown', onEvent)

            document.removeEventListener('touchstart', onEvent)

            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open, toggle])

    return open ? (
        <div
            {...props}
            css={[
                tw`
                    fixed
                    bg-[rgba(246, 246, 246, 0.9)]
                    dark:bg-[rgba(0, 0, 0, 0.8)]
                    z-10
                    w-full
                    h-full
                    left-0
                    top-0
                `,
            ]}
        >
            <div
                ref={bodyRef}
                css={[
                    tw`
                        w-[35rem]
                        h-full
                        bg-off-white
                        dark:bg-dark-grey
                        absolute
                        right-0
                        top-0
                        transition-transform
                        overflow-auto
                        shadow-[0 0 15px rgba(0, 0, 0, 0.08)]
                        dark:shadow-[0 0 10px 5px rgba(0, 0, 0, 0.25)]
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    ) : null
}

type DrawerHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
    title: string
}

export function DrawerHeader({ title, ...props }: DrawerHeaderProps) {
    return (
        <div
            css={[
                tw`
                    px-14
                    mb-6
                `,
            ]}
        >
            <div
                {...props}
                css={[
                    tw`
                        flex
                        items-center
                        h-24
                    `,
                ]}
            >
                <h2
                    css={[
                        css`
                            line-height: normal;
                        `,
                        tw`
                            text-[1.75rem]
                            font-medium
                            text-darker-grey
                            dark:text-lighter-grey
                        `,
                    ]}
                >
                    {title}
                </h2>
            </div>
            <hr
                css={[
                    tw`
                        border-0
                        h-[1px]
                        bg-lighter-grey
                        dark:bg-darkish-grey
                    `,
                ]}
            />
        </div>
    )
}
