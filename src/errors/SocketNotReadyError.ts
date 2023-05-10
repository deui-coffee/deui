export default class SocketNotReadyError extends Error {
    name = 'SocketNotReadyError'

    constructor() {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SocketNotReadyError)
        }

        Object.setPrototypeOf(this, SocketNotReadyError.prototype)
    }
}
