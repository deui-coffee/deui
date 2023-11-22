import { useMajorState } from '$/stores/data'
import { useUiStore } from '$/stores/ui'
import { MachineMode, MajorState, Period, Time } from '$/shared/types'
import { useEffect, useState } from 'react'
import { Metrics, VerticalMetrics } from '$/components/Metric'

export function useIsMachineModeActive() {
    const majorState = useMajorState()

    switch (useUiStore().machineMode) {
        case MachineMode.Espresso:
            return majorState === MajorState.Espresso
        case MachineMode.Flush:
            return majorState === MajorState.HotWaterRinse
        case MachineMode.Steam:
            return majorState === MajorState.Steam
        case MachineMode.Water:
            return majorState === MajorState.HotWater
        default:
    }

    return false
}

export function useCurrentTime() {
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

export function useMetrics({ verticalLayout }: { verticalLayout?: boolean } = {}) {
    const { machineMode } = useUiStore()

    const [measurableMachineMode, setMeasurableMachineMode] = useState(
        machineMode === MachineMode.Server ? MachineMode.Espresso : machineMode
    )

    useEffect(() => {
        if (machineMode === MachineMode.Server) {
            return
        }

        setMeasurableMachineMode(machineMode)
    }, [machineMode])

    return [...(verticalLayout ? VerticalMetrics : Metrics)[measurableMachineMode]]
}
