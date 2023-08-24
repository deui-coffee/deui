export default function stopwatch() {
    let frameRequestId: number | undefined

    let startedAt: number | undefined

    let elapsedCache: number | undefined

    return {
        start({ onTick, tps = 10 }: { onTick?: (elapsed: number) => void; tps?: number } = {}) {
            if (frameRequestId != null) {
                return
            }

            function tick(t: number) {
                if (typeof startedAt === 'undefined') {
                    startedAt = t
                }

                const elapsed = 0 | ((t - startedAt) / (1000 / tps))

                if (elapsedCache !== elapsed) {
                    elapsedCache = elapsed

                    onTick?.(elapsed / tps)
                }

                frameRequestId = requestAnimationFrame(tick)
            }

            tick(performance.now())
        },
        stop() {
            if (frameRequestId != null) {
                cancelAnimationFrame(frameRequestId)
            }

            frameRequestId = undefined

            startedAt = undefined

            elapsedCache = undefined
        },
    }
}
