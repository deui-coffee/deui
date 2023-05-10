export default class ExecutionError extends Error {
    name = 'ExecutionError'

    constructor() {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ExecutionError)
        }

        Object.setPrototypeOf(this, ExecutionError.prototype)
    }
}
