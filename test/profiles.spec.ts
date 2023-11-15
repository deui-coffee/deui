import { RawProfile } from '$/types'
import fs from 'fs'
import path from 'path'

describe('Predefined profiles', () => {
    fs.readdirSync(path.resolve(__dirname, '../public/profiles')).forEach((filename) => {
        const id = filename.replace(/\.json$/i, '')

        describe(`Profile #${id}`, () => {
            it('is valid', () => {
                expect(() => {
                    RawProfile.parse(
                        JSON.parse(
                            fs
                                .readFileSync(
                                    path.resolve(__dirname, '../public/profiles', filename)
                                )
                                .toString()
                        )
                    )
                }).not.toThrow()
            })
        })
    })
})
