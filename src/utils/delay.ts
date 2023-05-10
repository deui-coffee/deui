import AbortError from '../errors/AbortError'
import defer from './defer'

interface Options {
    abortSignal?: AbortSignal
}

export default async function delay(
    ms: number,
    { abortSignal }: { abortSignal?: AbortSignal } = {}
) {
    const { resolve, reject, promise } = await defer()

    const timeoutId = window.setTimeout(resolve, ms)

    function onAbort() {
        reject(new AbortError())
    }

    if (abortSignal) {
        if (abortSignal.aborted) {
            onAbort()
        } else {
            abortSignal.addEventListener('abort', onAbort)
        }
    }

    try {
        await promise
    } catch (e) {
        window.clearTimeout(timeoutId)

        throw e
    }
}
