import axios from 'axios'
import { Buffer } from 'buffer'
import { Profile, ShotExecCommand, ShotExecMethod, ShotSettings } from '$/types'
import { toEncodedShot, toEncodedShotSettings } from './shot'

type ExecCommand = 'scan' | 'on' | 'off' | ShotExecCommand

export async function exec(command: ExecCommand) {
    switch (command) {
        case 'scan':
        case 'on':
        case 'off':
            await axios.post(`/${command}`)
            break
        default:
            await axios.post(`/exec`, {
                ...command,
                params: command.params.toString('hex'),
            })
    }
}

export async function uploadProfile(
    profile: Profile,
    shotSettings: ShotSettings
): Promise<ShotSettings> {
    const payloads = toEncodedShot(profile)

    const [{ temperature: TargetGroupTemp = undefined } = {}] = profile.steps

    const { target_volume: TargetEspressoVol } = profile

    if (TargetGroupTemp == null) {
        throw new Error('Invalid shot temperatore')
    }

    await exec({
        method: ShotExecMethod.ShotBeginProfileWrite,
        params: Buffer.from(profile.id),
    })

    for (const { method, payload: params } of payloads) {
        await exec({
            method,
            params,
        })
    }

    const newShotSettings: ShotSettings = {
        ...shotSettings,
        TargetGroupTemp,
        TargetEspressoVol,
    }

    await exec({
        method: ShotExecMethod.ShotSettings,
        params: toEncodedShotSettings(newShotSettings),
    })

    await exec({
        method: ShotExecMethod.ShotEndProfileWrite,
        params: Buffer.from(profile.id),
    })

    return newShotSettings
}
