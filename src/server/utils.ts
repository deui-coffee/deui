import fs from 'fs'
import path from 'path'
import { Characteristic } from '@abandonware/noble'
import debug from 'debug'
import EventEmitter from 'events'
import { Application, Locals } from 'express'
import { createServer } from 'http'
import { Draft, produce } from 'immer'
import os from 'os'
import { WebSocket, WebSocketServer } from 'ws'
import { z } from 'zod'
import { getCharName, toU8P0 } from '../shared/utils'
import {
    CharAddr,
    MMRAddr,
    MsgType,
    Profile,
    RawProfile,
    ServerErrorCode,
    ShotSettings,
    SteamSetting,
} from '../types'
import { toEncodedShot, toEncodedShotSettings } from '../utils/shot'
import { Char } from './comms'

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

export function send(ws: WebSocket, payload: unknown) {
    ws.send(JSON.stringify(payload))
}

export function broadcast(wss: WebSocketServer, payload: unknown) {
    wss.clients.forEach((ws) => void send(ws, payload))
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
                z.literal(ServerErrorCode.Locked),
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

export function setRemoteState(
    app: Application,
    fn: (draft: Draft<Locals['remoteState']>) => void
) {
    app.locals.remoteState = produce(app.locals.remoteState, fn)

    broadcast(app.locals.wss, {
        type: MsgType.State,
        payload: app.locals.remoteState,
    })
}

export function listen(app: Application, options: { port?: number | string } = {}) {
    const port = Number(options.port) || 3001

    const server = createServer(app).on('upgrade', (req, socket, head) => {
        const { wss } = app.locals

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
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

    app.locals.wss.on('connection', (ws) => {
        info('New client')

        send(ws, {
            type: MsgType.State,
            payload: app.locals.remoteState,
        })

        send(ws, {
            type: MsgType.Characteristics,
            payload: app.locals.characteristicValues,
        })

        ws.on('close', () => void info('Client disconnected'))

        ws.on('error', () => void error('Shit did happen, eh?'))

        ws.on('message', (data) => void info('Received %s', data))
    })
}

export async function writeProfile(app: Application, profileId: string): Promise<Profile> {
    const profile = {
        id: profileId,
        ...RawProfile.parse(
            JSON.parse(
                fs
                    .readFileSync(
                        path.resolve(app.locals.profilesDir, 'profiles', `${profileId}.json`)
                    )
                    .toString('utf-8')
            )
        ),
    }

    info(`Uploading profile: ${profile.title}…`)

    const [header, ...frames] = toEncodedShot(profile)

    await Char.write(app, CharAddr.HeaderWrite, header)

    for (const frame of frames) {
        await Char.write(app, CharAddr.FrameWrite, frame)
    }

    info(`Uploading profile: ${profile.title}… Done.`)

    return profile
}

/**
 * Writes the `ShotSettings` characteristic.
 * @param shotSettings A function or explicit shot settings, or undefined for default
 * shot settings. `TargetEspressoVol` and `TargetGroupTemp` will be taken
 * from `options.profile` if present.
 */
export async function writeShotSettings(
    app: Application,
    shotSettings: undefined | ShotSettings | ((defaultShotSettings: ShotSettings) => ShotSettings),
    options: { profile?: Profile }
): Promise<ShotSettings> {
    const defaultShotSettings = {
        SteamSettings: SteamSetting.LowPower,
        TargetSteamTemp: toU8P0(160),
        TargetSteamLength: toU8P0(120),
        TargetHotWaterTemp: toU8P0(98),
        TargetHotWaterVol: toU8P0(70),
        TargetHotWaterLength: toU8P0(60),
        TargetEspressoVol: toU8P0(200),
        TargetGroupTemp: toU8P0(88),
    }

    let newShotSettings =
        typeof shotSettings === 'function'
            ? shotSettings(defaultShotSettings)
            : shotSettings || defaultShotSettings

    const { profile } = options

    if (profile) {
        const {
            steps: [{ temperature: TargetGroupTemp = undefined } = {}],
            target_volume: TargetEspressoVol,
        } = profile

        if (typeof TargetGroupTemp === 'undefined') {
            throw new Error('Invalid target group temp')
        }

        newShotSettings = {
            ...newShotSettings,
            TargetEspressoVol,
            TargetGroupTemp,
        }
    }

    info('Writing shot settings…')

    await Char.write(app, CharAddr.ShotSettings, toEncodedShotSettings(newShotSettings))

    info('Writing shot settings… Done.')

    return newShotSettings
}

export function lock<T extends () => any = () => void>(
    app: Application,
    fn: T,
    ...args: Parameters<T>
): ReturnType<T> {
    app.locals.locks++

    const result = (fn as any)(...args)

    if (!(result instanceof Promise)) {
        return result
    }

    return result.finally(() => {
        app.locals.locks--
    }) as ReturnType<T>
}
