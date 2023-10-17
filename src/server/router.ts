import {
    CharAddr,
    MajorState,
    RemoteState,
    ServerErrorCode,
    ShotExecCommand,
    ShotExecMethod,
} from '../types'
import { Characteristic } from '@abandonware/noble'
import { Response, Router } from 'express'
import { IncomingMessage } from 'http'
import { z } from 'zod'
import { knownError } from './utils'

export function router({
    getCharacteristic,
    getRemoteState,
    scan,
    setProfile,
}: {
    getCharacteristic: (uuid: string) => Characteristic | undefined
    getRemoteState: () => RemoteState
    scan?: () => void
    setProfile?: (profile: Required<RemoteState['profile']>) => void
}) {
    const r = Router()

    function writeCharacteristic(
        uuid: string,
        data: Buffer,
        { withoutResponse = false }: { withoutResponse?: boolean } = {}
    ) {
        return async (_: IncomingMessage, res: Response) => {
            const { device } = getRemoteState()

            if (!device) {
                throw knownError(409, ServerErrorCode.NotConnected)
            }

            const characteristic = getCharacteristic(uuid)

            if (!characteristic) {
                throw knownError(422, ServerErrorCode.UnknownCharacteristic)
            }

            await characteristic.writeAsync(data, withoutResponse)

            res.status(200).end()
        }
    }

    r.get('/', () => {
        throw 404
    })

    r.post('/scan', (_, res) => {
        const { bluetoothState, scanning, connecting, device } = getRemoteState()

        if (bluetoothState !== 'poweredOn') {
            throw knownError(409, ServerErrorCode.NotPoweredOn)
        }

        if (scanning) {
            throw knownError(409, ServerErrorCode.AlreadyScanning)
        }

        if (connecting) {
            throw knownError(409, ServerErrorCode.AlreadyConnecting)
        }

        if (device) {
            throw knownError(409, ServerErrorCode.AlreadyConnected)
        }

        scan?.()

        res.status(200).json({})
    })

    r.post('/exec', (req, res) => {
        const command = req.body

        if (!isExecCommand(command)) {
            throw 404
        }

        let charAddr: CharAddr = CharAddr.FrameWrite

        const { profile } = getRemoteState()

        switch (command.method) {
            case ShotExecMethod.Header:
                charAddr = CharAddr.HeaderWrite
                break
            case ShotExecMethod.ShotSettings:
                charAddr = CharAddr.ShotSettings
                break
            case ShotExecMethod.ShotBeginProfileWrite:
            case ShotExecMethod.ShotEndProfileWrite:
                if (command.method === ShotExecMethod.ShotBeginProfileWrite && !profile.ready) {
                    /**
                     * Reject attempts to write new profile structure if one is already being written.
                     */
                    throw knownError(409, ServerErrorCode.AlreadyWritingShot)
                }

                setProfile?.({
                    id: Buffer.from(command.params as any, 'hex').toString(),
                    ready: command.method === ShotExecMethod.ShotEndProfileWrite,
                })

                return void res.status(200).end()
            default:
                break
        }

        writeCharacteristic(charAddr, Buffer.from(command.params as any, 'hex'))(req, res)
    })

    r.post('/on', writeCharacteristic(CharAddr.RequestedState, Buffer.from([MajorState.Idle])))

    r.post('/off', writeCharacteristic(CharAddr.RequestedState, Buffer.from([MajorState.Sleep])))

    return r
}

const ExecCommand = z.object({
    method: z
        .literal(ShotExecMethod.Frame)
        .or(z.literal(ShotExecMethod.Header))
        .or(z.literal(ShotExecMethod.Tail))
        .or(z.literal(ShotExecMethod.ShotSettings))
        .or(z.literal(ShotExecMethod.ShotBeginProfileWrite))
        .or(z.literal(ShotExecMethod.ShotEndProfileWrite)),
    params: z.string().regex(/[a-f\d]{2,}/i),
})

function isExecCommand(arg: unknown): arg is ShotExecCommand {
    return ExecCommand.safeParse(arg).success
}
