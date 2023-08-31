import { Profile, RawProfile } from '$/types'
import profiles from '../src/generated/profiles.json'
import fs from 'fs'
import path from 'path'

describe('Predefined profiles', () => {
    profiles.forEach(({ name, id }) => {
        describe(`${id} (${name})`, () => {
            it('has got a name', () => {
                expect(name).toBeTruthy()
            })

            it('is valid', () => {
                expect(() => {
                    RawProfile.parse(
                        JSON.parse(
                            fs
                                .readFileSync(
                                    path.resolve(__dirname, '../public/profiles', `${id}.json`)
                                )
                                .toString()
                        )
                    )
                }).not.toThrow()
            })
        })
    })
})
