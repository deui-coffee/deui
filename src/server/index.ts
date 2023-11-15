#!/usr/bin/env node

import bodyParser from 'body-parser'
import express from 'express'
import morgan from 'morgan'
import { WebSocketServer } from 'ws'
import getDefaultRemoteState from '../utils/getDefaultRemoteState'
import { setupBluetooth } from './bt'
import development from './middlewares/development'
import { rescue } from './middlewares/errors'
import production from './middlewares/production'
import { router } from './router'
import { listen } from './utils'

const app = express()

Object.assign(app.locals, {
    remoteState: getDefaultRemoteState(),
    characteristicValues: {},
    mmrData: {},
    wss: new WebSocketServer({ noServer: true, path: '/' }),
})

app.use(express.static('public'))

app.use(bodyParser.json())

app.use(morgan('dev'))

app.use(production())

app.use(development())

app.use(router())

app.use(rescue())

listen(app, { port: process.env.PORT })

setupBluetooth(app, { scan: true })
