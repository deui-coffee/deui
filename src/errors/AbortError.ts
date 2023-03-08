export default class AbortError extends Error {
    name = 'AbortError'

    constructor() {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AbortError)
        }

        Object.setPrototypeOf(this, AbortError.prototype)
    }
}
