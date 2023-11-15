import { Response, Router } from 'express'
import { IncomingMessage } from 'http'
import { z } from 'zod'
import { CharAddr, MajorState, ServerErrorCode, ShotExecCommand, ShotExecMethod } from '../types'
import { knownError, setRemoteState } from './utils'

export function router() {
    const r = Router()

    function writeCharacteristic(
        uuid: string,
        data: Buffer,
        { withoutResponse = false }: { withoutResponse?: boolean } = {}
    ) {
        return async (_: IncomingMessage, res: Response) => {
            const {
                remoteState: { device },
                characteristics: { [uuid]: characteristic },
            } = res.app.locals

            if (!device) {
                throw knownError(409, ServerErrorCode.NotConnected)
            }

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

    /**
     * @deprecated The server performs scans automatically now.
     */
    r.post('/scan', (_, res) => {
        res.status(200).json({})
    })

    r.post('/exec', (req, res) => {
        const command = req.body

        if (!isExecCommand(command)) {
            throw 404
        }

        let charAddr: CharAddr = CharAddr.FrameWrite

        const { profile } = res.app.locals.remoteState

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

                setRemoteState(res.app, (rs) => {
                    Object.assign(rs.profile, {
                        id: Buffer.from(command.params as any, 'hex').toString(),
                        ready: command.method === ShotExecMethod.ShotEndProfileWrite,
                    })
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
