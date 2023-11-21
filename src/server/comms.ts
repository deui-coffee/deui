import { Application } from 'express'
import { sleep } from '../shared/utils'
import { CharAddr, MMRAddr, ServerErrorCode } from '../types'
import { MMREventEmitter, knownError } from './utils'

const emitter = new MMREventEmitter()

export const Mmr = Object.freeze({
    async read(app: Application, addr: MMRAddr, length: number) {
        const buf = Buffer.alloc(20, 0)

        buf.writeUint32BE(addr)

        buf.writeUint8(length, 0)

        let onRead: ((addr: MMRAddr, data: Buffer) => void) | undefined = undefined

        try {
            return await Promise.race([
                new Promise<Buffer>((_, reject) => {
                    sleep(10000).then(() => void reject(new Error('Timeout')))
                }),
                new Promise<Buffer>((resolve, reject) => {
                    onRead = (incomingAddr, data) => {
                        if (incomingAddr === addr) {
                            resolve(data)
                        }
                    }

                    emitter.on('read', onRead)

                    void (async () => {
                        try {
                            const { [CharAddr.ReadFromMMR]: characteristic } =
                                app.locals.characteristics

                            if (!characteristic) {
                                throw knownError(409, ServerErrorCode.UnknownCharacteristic)
                            }

                            await characteristic.writeAsync(buf, false)
                        } catch (e) {
                            reject(e)
                        }
                    })()
                }),
            ])
        } finally {
            if (onRead) {
                emitter.off('read', onRead)
            }
        }
    },

    async write(app: Application, addr: MMRAddr, value: Buffer) {
        const { [CharAddr.WriteToMMR]: characteristic } = app.locals.characteristics

        if (!characteristic) {
            throw knownError(409, ServerErrorCode.UnknownCharacteristic)
        }

        const buf = Buffer.alloc(20, 0)

        buf.writeUint32BE(addr)

        buf.writeUint8(value.byteLength, 0)

        value.copy(buf, 4)

        await characteristic.writeAsync(buf, false)
    },

    async tweakHeaters(app: Application) {
        await Mmr.write(app, MMRAddr.HeaterUp1Flow, Mmr.formatUint32(20))

        await Mmr.write(app, MMRAddr.HeaterUp2Flow, Mmr.formatUint32(40))

        await Mmr.write(app, MMRAddr.WaterHeaterIdleTemp, Mmr.formatUint32(990))

        await Mmr.write(app, MMRAddr.HeaterUp2Timeout, Mmr.formatUint32(10))

        await Mmr.write(app, MMRAddr.SteamPurgeMode, Mmr.formatUint32(0))

        await Mmr.writeFlushTimeout(app, 5)

        await Mmr.writeFlushFlowRate(app, 6)

        await Mmr.writeHotwaterFlowRate(app, 10)
    },

    async writeHotwaterFlowRate(app: Application, rate: number) {
        await Mmr.write(app, MMRAddr.HotWaterFlowRate, Mmr.formatUint32((rate * 10) | 0))
    },

    async writeFlushFlowRate(app: Application, rate: number) {
        await Mmr.write(app, MMRAddr.FlushFlowRate, Mmr.formatUint32((rate * 10) | 0))
    },

    async writeFlushTimeout(app: Application, seconds: number) {
        await Mmr.write(app, MMRAddr.FlushTimeout, Mmr.formatUint32((seconds * 10) | 0))
    },

    /**
     * We write bufs into characteristics using big endian order of bytes
     * and we do the opposite when it comes to writing into MMR - we use
     * little endian here.
     */
    formatUint32(value: number) {
        const buf = Buffer.alloc(4, 0)

        buf.writeUint32LE(value)

        return buf
    },

    receive(addr: MMRAddr, data: Buffer) {
        emitter.emit('read', addr, data)
    },
})

export const Char = Object.freeze({
    async write(app: Application, addr: CharAddr, buffer: Buffer) {
        const { [addr]: characteristic } = app.locals.characteristics

        if (!characteristic) {
            throw knownError(409, ServerErrorCode.UnknownCharacteristic)
        }

        await characteristic.writeAsync(buffer, false)
    },

    async read(app: Application, addr: CharAddr) {
        const { [addr]: characteristic } = app.locals.characteristics

        if (!characteristic) {
            throw knownError(409, ServerErrorCode.UnknownCharacteristic)
        }

        return characteristic.readAsync()
    },

    formatUint16(value: number) {
        const buf = Buffer.alloc(2, 0)

        buf.writeUint16BE(value)

        return buf
    },
})
