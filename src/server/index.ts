#!/usr/bin/env node

import bodyParser from 'body-parser'
import express from 'express'
import morgan from 'morgan'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import getDefaultRemoteState from '../utils/getDefaultRemoteState'
import { setupBluetooth } from './bt'
import development from './middlewares/development'
import { rescue } from './middlewares/errors'
import production from './middlewares/production'
import { router } from './router'
import { listen } from './utils'
import env from './env'
import { allowPrivateNetwork } from './middlewares/misc'

const app = express()

Object.assign(app.locals, {
    characteristics: {},
    characteristicValues: {},
    locks: 0,
    mmrData: {},
    profiles: undefined,
    profilesDir: env === 'production' ? __dirname : 'public',
    remoteState: getDefaultRemoteState(),
    wss: new WebSocketServer({ noServer: true, path: '/' }),
})

app.use(express.static('public'))

app.use(bodyParser.json())

app.use(morgan('dev'))

app.use(allowPrivateNetwork)

app.use(
    cors({
        origin: [/\/\/127\.0\.0\.1:/, /\/\/0\.0\.0\.0:/, /\/\/localhost:/, /\.deui\.coffee$/],
    })
)

app.use(production())

app.use(development())

app.use(router())

app.use(rescue())

listen(app, { port: process.env.PORT })

setupBluetooth(app)
