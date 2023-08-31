import { NextFunction, Request, Response } from 'express'
import path from 'path'
import serveStatic from 'serve-static'

export default function production() {
    if (process.env.NODE_ENV !== 'production') {
        return (_: Request, __: Response, next: NextFunction) => {
            next()
        }
    }

    return serveStatic(path.resolve(__dirname, '.'), {
        index: 'index.html',
    })
}
