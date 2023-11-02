import os from 'os'
import { CharAddr, MMRAddr, ServerErrorCode } from '../types'
import { Characteristic } from '@abandonware/noble'
import debug from 'debug'
import { Application } from 'express'
import { createServer } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { z } from 'zod'
import { getCharName } from '../shared/utils'
import EventEmitter from 'events'

export const info = debug('deui-server:info')

export const error = debug('deui-server:error')

export const verbose = debug('deui-server:verbose')

async function subscribe(char: Characteristic) {
    try {
        await char.subscribeAsync()

        info(`Subscribed to ${char.uuid}`)
    } catch (e) {
        error('failed to subscribe')
    }
}

export async function watchCharacteristic(
    char: Characteristic,
    { onData }: { onData?: (uuid: string, data: Buffer) => void }
) {
    const uuid = longCharacteristicUUID(char.uuid)

    const charName = getCharName(uuid)

    char.on('data', (data) => {
        verbose('Data received', charName, data)

        onData?.(uuid, data)
    })

    try {
        await char.readAsync()

        info(`Read`, charName)

        await subscribe(char)
    } catch (e) {
        error('Failed to read', charName, e)
    }
}

export function longCharacteristicUUID(uuid: string) {
    if (uuid.length !== 4) {
        throw new Error('Invalid short UUID')
    }

    return `0000${uuid}-0000-1000-8000-00805f9b34fb` as CharAddr
}

export const wsServer = new WebSocketServer({ noServer: true, path: '/' })

export function send(ws: WebSocket, payload: unknown) {
    ws.send(JSON.stringify(payload))
}

export function broadcast(payload: unknown) {
    wsServer.clients.forEach((ws) => void send(ws, payload))
}

export function startDeuiServer(app: Application, { port }: { port: number }) {
    const server = createServer(app).on('upgrade', (req, socket, head) => {
        wsServer.handleUpgrade(req, socket, head, (ws) => {
            wsServer.emit('connection', ws, req)
        })
    })

    // @ts-ignore 0.0.0.0 is a valid host. TS expects a number (?).
    server.listen(port, '0.0.0.0', () => {
        info('Listening on %d…', port)

        const addrs: string[] = []

        Object.values(os.networkInterfaces())
            .flatMap((i) => i ?? [])
            .filter(({ address, family } = {} as any) => {
                return (
                    address &&
                    (family === 'IPv4' ||
                        // @ts-expect-error Can be a number in node 18.0-18.3
                        family === 4)
                )
            })
            .forEach(({ address }) => {
                addrs.push(`http://${address}:${port}/`)
            })

        console.log(`Deui running at:\n${addrs.map((addr) => `- ${addr}`).join('\n')}`)
    })
}

const KnownError = z.union([
    z.number(),
    z.object({
        code: z
            .union([
                z.literal(ServerErrorCode.NotPoweredOn),
                z.literal(ServerErrorCode.AlreadyScanning),
                z.literal(ServerErrorCode.AlreadyConnecting),
                z.literal(ServerErrorCode.AlreadyConnected),
                z.literal(ServerErrorCode.NotConnected),
                z.literal(ServerErrorCode.UnknownCharacteristic),
                z.literal(ServerErrorCode.AlreadyWritingShot),
            ])
            .optional(),
        statusCode: z.number(),
    }),
])

type KnownError = z.infer<typeof KnownError>

export function isKnownError(error: unknown): error is KnownError {
    return KnownError.safeParse(error).success
}

export function knownError(statusCode: number, code: ServerErrorCode): KnownError {
    return { statusCode, code }
}

export class MMREventEmitter extends EventEmitter {
    on(eventName: 'read', listener: (addr: MMRAddr, data: Buffer) => void): this

    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(eventName, listener)
    }

    emit(eventName: 'read', addr: MMRAddr, data: Buffer): boolean

    emit(eventName: string | symbol, ...args: any[]): boolean {
        return super.emit(eventName, ...args)
    }

    off(eventName: 'read', listener: (addr: MMRAddr, data: Buffer) => void): this

    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return super.off(eventName, listener)
    }
}
