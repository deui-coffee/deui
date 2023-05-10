export default class MachineNotFoundError extends Error {
    name = 'MachineNotFoundError'

    constructor() {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MachineNotFoundError)
        }

        Object.setPrototypeOf(this, MachineNotFoundError.prototype)
    }
}
