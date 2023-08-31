import { NextFunction, Request, Response } from 'express'
import path from 'path'
import serveStatic from 'serve-static'
import env from '../env'

export default function production() {
    if (env !== 'production') {
        return (_: Request, __: Response, next: NextFunction) => {
            next()
        }
    }

    return serveStatic(path.resolve(__dirname, '.'), {
        index: 'index.html',
    })
}
