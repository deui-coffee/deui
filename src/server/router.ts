import { Request, Router } from 'express'
import { CharAddr, MajorState } from '../types'
import { lock, setRemoteState, writeProfile, writeShotSettings } from './utils'
import { checkLocks, preloadProfiles } from './middlewares/misc'
import { Char } from './comms'

export function router() {
    const r = Router()

    r.get('/', () => {
        throw 404
    })

    r.post('/on', checkLocks, async (_, res) => {
        await lock(res.app, () =>
            Char.write(res.app, CharAddr.RequestedState, Buffer.from([MajorState.Idle]))
        )

        res.status(200).end()
    })

    r.post('/off', checkLocks, async (_, res) => {
        await lock(res.app, () =>
            Char.write(res.app, CharAddr.RequestedState, Buffer.from([MajorState.Sleep]))
        )

        res.status(200).end()
    })

    r.get('/state', (_, res) => {
        res.json(res.app.locals.remoteState)
    })

    r.post(
        '/profile-list/:profileId',
        checkLocks,
        async (req: Request<{ profileId: string }>, res) => {
            const { app } = res

            await lock(app, async () => {
                const profile = await writeProfile(app, req.params.profileId)

                setRemoteState(app, (draft) => {
                    draft.profileId = profile.id
                })

                await writeShotSettings(app, undefined, { profile })
            })

            res.status(200).end()
        }
    )

    r.get('/profile-list', preloadProfiles, (_, res) => {
        res.json(res.app.locals)
    })

    return r
}
