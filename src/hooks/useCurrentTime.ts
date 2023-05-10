import { useEffect, useState } from 'react'

enum Period {
    Am = 'am',
    Pm = 'pm',
}

interface Time {
    period: Period
    hour: string
    minute: string
}

export default function useCurrentTime() {
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

                const [, hour = '', minute = '', period = Period.Am] =
                    newTime.toLowerCase().match(/^(\d+):(\d+) (am|pm)$/i) || []

                setTime({
                    period: period as Period,
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

    return time
}
