import { NextFunction, Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import cors from 'cors'

export default function development() {
    if (process.env.NODE_ENV === 'production') {
        return (_: Request, __: Response, next: NextFunction) => {
            next()
        }
    }

    return [
        cors(),
        createProxyMiddleware(
            (pathname: string, req: Request) => {
                return req.method !== 'POST' || !/^\/(scan|on|off|exec)/.test(pathname)
            },
            {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            }
        ),
    ]
}