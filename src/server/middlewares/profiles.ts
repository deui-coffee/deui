import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { RawProfile } from '../../types'

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
