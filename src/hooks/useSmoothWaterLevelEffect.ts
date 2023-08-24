import { useDataStore } from '$/stores/data'
import { Prop } from '$/types'
import { useEffect, useRef } from 'react'

const Duration = 1000

export function useSmoothWaterLevelEffect(onChange?: (level: number) => void) {
    const onChangeRef = useRef(onChange)

    if (onChangeRef.current !== onChange) {
        onChangeRef.current = onChange
    }

    const { [Prop.WaterLevel]: toLevel = 0 } = useDataStore().properties

    const levelRef = useRef(toLevel)

    useEffect(() => {
        let mounted = true

        let frameRequestId: number | undefined

        let startedAt: number | undefined

        const { current: fromLevel } = levelRef

        function tick(t: number) {
            if (startedAt == null) {
                startedAt = t
            }

            const dist = toLevel - fromLevel

            /**
             * Let's make the transition last for a *needed* portion
             * of the full duration:
             * - 0 -> 1: 100% of the duration,
             * - 1 -> 0.5: 50% of it, and so on.
             */
            let pos = (t - startedAt) / (Duration * Math.abs(dist))

            if (pos > 1) {
                pos = 1
            }

            const level = fromLevel + dist * pos

            levelRef.current = level

            if (!mounted) {
                return
            }

            onChangeRef.current?.(level)

            if (pos === 1) {
                return
            }

            frameRequestId = requestAnimationFrame(tick)
        }

        tick(performance.now())

        return () => {
            mounted = false

            if (frameRequestId != null) {
                cancelAnimationFrame(frameRequestId)
            }
        }
    }, [toLevel])
}
