import { Router } from 'express'
import { CharAddr, MajorState } from '../types'
import { setRemoteState, writeProfile, writeShotSettings } from './utils'
import { preloadProfiles } from './middlewares/profiles'
import { Char } from './comms'

export function router() {
    const r = Router()

    r.get('/', () => {
        throw 404
    })

    r.post('/on', async (_, res) => {
        await Char.write(res.app, CharAddr.RequestedState, Buffer.from([MajorState.Idle]))

        res.status(200).end()
    })

    r.post('/off', async (_, res) => {
        await Char.write(res.app, CharAddr.RequestedState, Buffer.from([MajorState.Sleep]))

        res.status(200).end()
    })

    r.get('/state', (_, res) => {
        res.json(res.app.locals.remoteState)
    })

    r.post('/profile-list/:profileId', async ({ params }, res) => {
        const { app } = res

        const profile = await writeProfile(res.app, params.profileId)

        setRemoteState(app, (draft) => {
            draft.profileId = profile.id
        })

        await writeShotSettings(app, undefined, { profile })

        res.status(200).end()
    })

    r.get('/profile-list', preloadProfiles, (_, res) => {
        res.json(res.app.locals)
    })

    return r
}
