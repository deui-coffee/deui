import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { RawProfile, ServerErrorCode } from '../../types'
import { knownError } from '../utils'

export function preloadProfiles(_: Request, res: Response, next: NextFunction) {
    const { app } = res

    const { profiles = [], profilesDir } = app.locals

    if (!app.locals.profiles) {
        fs.readdirSync(path.resolve(profilesDir, 'profiles')).forEach((filename) => {
            if (!/\.json$/i.test(filename)) {
                return
            }

            const profile = RawProfile.parse(
                JSON.parse(
                    fs
                        .readFileSync(path.resolve(profilesDir, 'profiles', filename))
                        .toString('utf-8')
                )
            )

            if (profile.hidden) {
                return
            }

            profiles.push({
                ...profile,
                id: filename.replace(/\.json$/, ''),
            })
        })

        profiles.sort(({ id: a }, { id: b }) => a.localeCompare(b))

        app.locals.profiles = profiles
    }

    next()
}

export function checkLocks(_: Request, res: Response, next: NextFunction) {
    const { locks } = res.app.locals

    if (locks > 0) {
        throw knownError(409, ServerErrorCode.Locked)
    }

    next()
}
