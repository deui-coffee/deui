import { Buffer } from 'buffer'
import { exec, useDataStore } from '$/stores/data'
import { toEncodedShotFrames } from '$/utils/shot'
import tw from 'twin.macro'
import { ShotExecMethod } from '$/types'

export default function Debug() {
    const { profile } = useDataStore()

    async function onClick() {
        try {
            if (!profile) {
                throw new Error('No profile selected')
            }

            const frames: Buffer[] = toEncodedShotFrames(profile)

            for (let i = 0; i < frames.length; i++) {
                const method =
                    i === 0
                        ? ShotExecMethod.Header
                        : i === frames.length - 1
                        ? ShotExecMethod.Tail
                        : ShotExecMethod.Frame

                await exec({
                    method,
                    params: frames[i],
                })
            }
        } catch (e) {
            console.error('Error', e)
        }
    }

    return (
        <div
            css={tw`
                rounded-lg
                fixed
                left-6
                top-6
                bg-white
                shadow-2xl
                p-10
            `}
        >
            <button
                type="button"
                onClick={onClick}
                css={tw`appearance-none bg-blue px-4 py-2 rounded-md shadow-sm`}
            >
                Submit
            </button>
        </div>
    )
}
