import { NextFunction, Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import cors from 'cors'
import env from '../env'

export default function development() {
    if (env === 'production') {
        return (_: Request, __: Response, next: NextFunction) => {
            next()
        }
    }

    return [
        cors(),
        createProxyMiddleware(
            (pathname: string, req: Request) => {
                switch (req.method) {
                    case 'POST':
                        return !/^\/(scan|on|off|exec)\/?/.test(pathname)
                    case 'GET':
                        return !/\/profile-list\/?$/.test(pathname)
                    default:
                        return true
                }
            },
            {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            }
        ),
        (_: Request, res: Response, next: NextFunction) => {
            res.app.locals.profilesDir = 'public'

            next()
        },
    ]
}
