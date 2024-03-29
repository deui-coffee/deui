import { NextFunction, Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import env from '../env'

export default function development() {
    if (env === 'production') {
        return (_: Request, __: Response, next: NextFunction) => {
            next()
        }
    }

    return [
        createProxyMiddleware(
            (pathname: string, req: Request) => {
                switch (req.method) {
                    case 'POST':
                        return (
                            pathname !== '/on' &&
                            pathname !== '/off' &&
                            !/^\/profile-list\/\w+$/.test(pathname)
                        )
                    case 'GET':
                        return !/\/(profile-list|state)\/?$/.test(pathname)
                    default:
                        return true
                }
            },
            {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            }
        ),
    ]
}
