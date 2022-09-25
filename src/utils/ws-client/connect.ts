import AbortError from '$/errors/AbortError'
import getCustodiedPromise from '../getCustodiedPromise'

export default async function connect(
    url: string,
    {
        onError: onErrorOpt,
        abortSignal,
    }: { onError?: (e: Event) => void; abortSignal?: AbortSignal } = {}
) {
    const ws = new WebSocket(url)

    const { resolve, reject, promise } = await getCustodiedPromise()

    function onOpen() {
        resolve()
    }

    function onError(e: Event) {
        if (typeof onErrorOpt === 'function') {
            onErrorOpt(e)
        }
    }

    function onAbort() {
        reject(new AbortError())
    }

    ws.addEventListener('open', onOpen)

    ws.addEventListener('close', reject)

    ws.addEventListener('error', onError)

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
        ws.removeEventListener('error', onError)

        throw e
    } finally {
        ws.removeEventListener('open', onOpen)

        ws.removeEventListener('close', reject)
    }

    return ws
}
