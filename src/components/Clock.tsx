import React, { useEffect, useState } from 'react'
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

            if (recentTime === newTime || !mounted) {
                return
            }

            recentTime = newTime

            const [, hour = '', minute = '', ampm = 'am'] =
                newTime.toLowerCase().match(/^(\d+):(\d+) (am|pm)$/i) || []

            setTime({
                ampm: ampm as Time['ampm'],
                hour,
                minute,
            })

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
                    text-[200px]
                `,
            ]}
        >
            {/* @TODO: Make sure digits take equal amount of space, horizontally. #no-jumping */}
            {time.hour}:{time.minute}
            <span
                css={[
                    tw`
                        text-[2rem]
                        opacity-50
                        uppercase
                    `,
                ]}
            >
                {time.ampm}
            </span>
        </div>
    )
}
