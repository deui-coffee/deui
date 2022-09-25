export default class MissingUrlError extends Error {
    name = 'MissingUrlError'

    constructor() {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MissingUrlError)
        }

        Object.setPrototypeOf(this, MissingUrlError.prototype)
    }
}
