export default class InvalidBackendStateError extends Error {
    name = 'InvalidBackendStateError'

    constructor() {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidBackendStateError)
        }

        Object.setPrototypeOf(this, InvalidBackendStateError.prototype)
    }
}
