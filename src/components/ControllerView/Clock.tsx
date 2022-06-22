import React, { HTMLAttributes, useEffect, useState } from 'react'
import tw from 'twin.macro'

type Time = {
    ampm: 'am' | 'pm'
    hour: string
    minute: string
}

type Props = {
    className?: string
}

export default function Clock({ className }: Props) {
    const [time, setTime] = useState<Time>()

    useEffect(() => {
        let mounted = true

        let recentTime: string

        let timeout: number | undefined

        function tick() {
            const newTime = new Date().toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            })

            if (!mounted) {
                return
            }

            if (recentTime !== newTime) {
                recentTime = newTime

                const [, hour = '', minute = '', ampm = 'am'] =
                    newTime.toLowerCase().match(/^(\d+):(\d+) (am|pm)$/i) || []

                setTime({
                    ampm: ampm as Time['ampm'],
                    hour,
                    minute,
                })
            }

            timeout = window.setTimeout(tick, 1000)
        }

        tick()

        return () => {
            if (timeout) {
                clearTimeout(timeout)
                timeout = undefined
            }

            mounted = false
        }
    }, [])

    if (typeof time === 'undefined') {
        return (
            <div className={className}>
                {/* Preserve space. */}
                &zwnj;
            </div>
        )
    }

    return (
        <div
            css={[
                tw`
                    select-none
                    text-[200px]
                    flex
                    text-dark-grey
                    dark:text-lighter-grey
                `,
            ]}
        >
            <div css={[tw`flex`]}>
                <Digits>{time.hour}</Digits>
                <Char css={[tw`w-[0.3em]`]}>:</Char>
                <Digits>{time.minute}</Digits>
            </div>
            <div>
                <span
                    css={[
                        tw`
                            font-medium
                            text-[2rem]
                            uppercase
                            text-light-grey
                            dark:text-medium-grey
                        `,
                    ]}
                >
                    {time.ampm}
                </span>
            </div>
        </div>
    )
}

interface DigitsProps {
    children: string
}

function Digits({ children }: DigitsProps) {
    return (
        <>
            {children.split('').map((d, i) => (
                <Char key={`${d}-${i}`}>{d}</Char>
            ))}
        </>
    )
}

function Char({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                tw`
                    w-[0.55em]
                    text-center
                    relative
                `,
            ]}
        >
            &zwnj;
            <div
                css={[
                    tw`
                        absolute
                        top-1/2
                        left-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    )
}
