import { NextFunction, Response } from 'express'
import { IncomingMessage } from 'http'
import { isKnownError } from '../utils'

export function rescue() {
    return (err: unknown, _req: IncomingMessage, res: Response, _next: NextFunction) => {
        if (!isKnownError(err)) {
            return void res.status(500).end()
        }

        const { statusCode, code } =
            typeof err === 'number' ? { statusCode: err, code: undefined } : err

        res.status(statusCode)

        if (typeof code === 'undefined') {
            return void res.end()
        }

        res.json({ code })
    }
}
