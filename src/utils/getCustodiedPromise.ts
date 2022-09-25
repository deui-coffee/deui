// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function getCustodiedPromise<T = void, E = any>() {
    let succeed: (value: T) => void = () => {
        //
    }

    let fail: (reason?: E) => void = () => {
        //
    }

    let promise: Promise<void | T> = Promise.resolve()

    await new Promise((ok: (_?: unknown) => void) => {
        promise = new Promise((resolve: (_: T) => void, reject: (_?: E) => void) => {
            succeed = resolve

            fail = reject

            // At this point we're sure both `done` and `fail` are set. Let's move on.
            ok()
        })
    })

    return {
        promise: promise as Promise<T>,
        reject: fail,
        resolve: succeed,
    }
}
