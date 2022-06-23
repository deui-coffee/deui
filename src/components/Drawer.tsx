import { Flag } from '$/features/misc/types'
import useFlag from '$/hooks/useFlag'
import useToggleProfilesDrawer from '$/hooks/useToggleProfilesDrawer'
import React, { HTMLAttributes, useEffect, useRef } from 'react'
import tw from 'twin.macro'

type Props = HTMLAttributes<HTMLDivElement> & {
    openFlag: Flag
}

export default function Drawer({ openFlag, children, ...props }: Props) {
    const open = useFlag(openFlag)

    const toggle = useToggleProfilesDrawer()

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

            console.log(e.target, bodyRef.current)

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
                    dark:bg-[rgba(23, 23, 23, 0.9)]
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
                        bg-white
                        dark:bg-black
                        absolute
                        right-0
                        top-0
                        transition-transform
                        overflow-auto
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    ) : null
}
