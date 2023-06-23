import { ShotFrame, ShotHeader } from '$/types'
import { Characteristic } from '@abandonware/noble'
import debug from 'debug'

export const info = debug('deui-server:info')

export const error = debug('deui-server:error')

export function fromF817(value: number) {
    return (value & 0x80) === 0 ? value / 10 : value & 0x7f
}

export function toF817(value: number) {
    if (value > 0x7f) {
        return 0xff
    }

    if (value > 12.75) {
        return 0x80 | (0.5 * value)
    }

    return 0xff & (0.5 + value * 10)
}

async function subscribe(char: Characteristic) {
    try {
        await char.subscribeAsync()

        info(`Subscribed to ${char.uuid}`)
    } catch (e) {
        error('failed to subscribe')
    }
}

export async function watchCharacteristic(
    char: Characteristic,
    { onData }: { onData?: (uuid: string, data: Buffer) => void }
) {
    const uuid = longCharacteristicUUID(char.uuid)

    char.on('data', (data) => {
        info('Data received', data)

        onData?.(uuid, data)
    })

    try {
        await char.readAsync()

        info(`Read ${uuid}`)

        await subscribe(char)
    } catch (e) {
        error('Failed to read', e)
    }
}

export function longCharacteristicUUID(uuid: string) {
    if (uuid.length !== 4) {
        throw new Error('Invalid short UUID')
    }

    return `0000${uuid}-0000-1000-8000-00805f9b34fb`
}

export async function getShot({
    headerChar,
    frameChar,
}: {
    headerChar: Characteristic
    frameChar: Characteristic
}) {
    try {
        await subscribe(headerChar)

        await subscribe(frameChar)

        try {
            const hbuf = await headerChar.readAsync()

            const header: ShotHeader = {
                HeaderV: hbuf.readUint8(0),
                NumberOfFrames: hbuf.readUint8(1),
                NumberOfPreinfuseFrames: hbuf.readUint8(2),
                MinimumPressure: hbuf.readUint8(3),
                MaximumFlow: hbuf.readUint8(4),
            }

            const frames: ShotFrame[] = []

            const numberOfFrames = hbuf.readUint8(1)

            for (let i = 0; i < numberOfFrames; i++) {
                const fbuf = await frameChar.readAsync()

                frames.push({
                    FrameToWrite: fbuf.readUint8(0),
                    Flag: fbuf.readUint8(1),
                    SetVal: fbuf.readUint8(2),
                    Temp: fbuf.readUint8(3) / 2,
                    FrameLen: fromF817(fbuf.readUint8(4)),
                    TriggerVal: fbuf.readUint8(5),
                    MaxVol: fbuf.readUint16BE(6) & 0x3ff,
                })
            }

            frames.sort(({ FrameToWrite: a }, { FrameToWrite: b }) => a - b)

            return {
                header,
                frames,
            }
        } catch (e) {
            error('Failed to load the shot frames')
        }
    } catch (e) {}
}
