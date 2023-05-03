import { Status } from '$/components/StatusIndicator'
import { Machine, Property, Shot } from '$/types'
import cafehub, {
    CafeHubController,
    CharAddr,
    ConnectionState,
    Message,
    RequestCommand,
    isConnectionStateMessage,
    isResponseMessage,
    isScanResultMessage,
} from '$/utils/cafehub'
import parseChar from '$/utils/parseChar'
import parseShotFrame from '$/utils/parseShotFrame'
import parseShotHeader from '$/utils/parseShotHeader'
import { produce } from 'immer'
import { create } from 'zustand'
import { Buffer } from 'buffer'

export enum WebSocketState {
    Opening = 'opening',
    Open = 'open',
    Closed = 'closed',
}

export enum CafeHubPhase {
    Opening = 'Opening…',
    Scanning = 'Scanning…',
    Connecting = 'Connecting…',
}

function getDefaultMachine(): Machine {
    return {
        waterCapacity: 1500,
    }
}

function getDefaultShot(): Shot {
    return {
        header: {
            HeaderV: 1,
            NumberOfFrames: 0,
            NumberOfPreinfuseFrames: 0,
            MinimumPressure: 0,
            MaximumFlow: 0,
        },
        frames: [],
    }
}

interface CafeHubStore {
    url: string

    wsState: WebSocketState

    chConnectionState: ConnectionState

    mac: string | undefined

    phase: CafeHubPhase | undefined

    connect: (url: string) => Promise<void>

    disconnect: () => void

    machine: Machine

    shot: Shot

    write: (
        payload: { char: CharAddr; data: Buffer },
        options?: { timeoutAfter?: number }
    ) => Promise<Message>
}

export const useCafeHubStore = create<CafeHubStore>((set, get) => {
    let controller: CafeHubController | undefined

    function setState(updater: (next: CafeHubStore) => void) {
        set((current) => produce(current, updater))
    }

    function registerCharData(char: CharAddr, data: string) {
        setState((next) => {
            switch (char) {
                case CharAddr.HeaderWrite:
                    next.shot.header = parseShotHeader(data)
                    break
                case CharAddr.FrameWrite:
                    next.shot.frames = parseShotFrame(next.shot.frames, data)
                    break
                default:
                    next.machine = {
                        ...next.machine,
                        ...parseChar(char, data),
                    }
            }
        })
    }

    return {
        url: '',

        wsState: WebSocketState.Closed,

        chConnectionState: ConnectionState.Disconnected,

        mac: undefined,

        phase: undefined,

        machine: getDefaultMachine(),

        shot: getDefaultShot(),

        async connect(url) {
            if (controller) {
                return
            }

            setState((next) => {
                next.url = url

                next.wsState = WebSocketState.Opening

                next.phase = CafeHubPhase.Opening
            })

            const ctrl = (controller = cafehub(url))

            while (true) {
                const msg = await ctrl.read()

                if (!msg) {
                    break
                }

                if (msg.type === 'open') {
                    console.info('WebSocket opened')

                    setState((next) => {
                        next.wsState = WebSocketState.Open

                        next.phase = CafeHubPhase.Scanning
                    })

                    setTimeout(async () => {
                        try {
                            await ctrl.send(
                                {
                                    command: RequestCommand.Scan,
                                    params: {
                                        Timeout: 10,
                                    },
                                },
                                {
                                    onBeforeResolve(msg) {
                                        return (
                                            isScanResultMessage(msg) && msg.results.Name === 'DE1'
                                        )
                                    },
                                    timeoutAfter: 3e4, // 30s
                                }
                            )

                            console.info('DE1 found')
                        } catch (e) {
                            console.warn('DE1 not found', e)

                            /**
                             * Failed to find a device? DC.
                             */
                            get().disconnect()
                        } finally {
                            setState((next) => {
                                if (next.phase === CafeHubPhase.Scanning) {
                                    next.phase = undefined
                                }
                            })
                        }
                    })

                    continue
                }

                if (msg.type === 'close') {
                    console.info('WebSocket closed')

                    setState((next) => {
                        next.wsState = WebSocketState.Closed

                        next.chConnectionState = ConnectionState.Disconnected

                        next.mac = undefined

                        next.phase = undefined

                        next.machine = getDefaultMachine()

                        next.shot = getDefaultShot()
                    })

                    continue
                }

                if (msg.type === 'error') {
                    console.warn('Error happened', msg.payload)

                    continue
                }

                if (msg.type === 'UPDATE') {
                    if (msg.update === 'ConnectionState') {
                        setState((next) => {
                            next.phase = undefined
                        })

                        const { CState, MAC } = msg.results

                        console.info('ConnectionState', CState)

                        setState((next) => {
                            next.chConnectionState = CState

                            next.mac = MAC
                        })

                        if (CState !== ConnectionState.Connected) {
                            continue
                        }

                        setTimeout(async () => {
                            const chars = [
                                CharAddr.WaterLevels,
                                CharAddr.Temperatures,
                                CharAddr.StateInfo,
                                CharAddr.HeaderWrite,
                                CharAddr.FrameWrite,
                            ]

                            for (let i = 0; i < chars.length; i++) {
                                const Char = chars[i]

                                try {
                                    await ctrl.send({
                                        command: RequestCommand.GATTSetNotify,
                                        params: {
                                            Char,
                                            Enable: true,
                                            MAC,
                                        },
                                    })

                                    console.info('Set notifications', Char)
                                } catch (e) {
                                    console.warn(
                                        'Failed to set notifications',
                                        Char,
                                        msg.results,
                                        e
                                    )
                                }

                                try {
                                    const resp = await ctrl.send({
                                        command: RequestCommand.GATTRead,
                                        params: {
                                            Char,
                                            MAC,
                                            Len: 0,
                                        },
                                    })

                                    if (!isResponseMessage(resp)) {
                                        throw new Error('Not a response message')
                                    }

                                    registerCharData(Char, resp.results.Data)
                                } catch (e) {
                                    console.warn('Failed to read characteristics', Char, e)
                                }
                            }
                        })

                        continue
                    }

                    if (msg.update === 'ExecutionError') {
                        console.warn('Execution error happened', msg.results)

                        continue
                    }

                    if (msg.update === 'GATTNotify') {
                        console.info('Been notified', msg.results)

                        const { Char: char, Data: data } = msg.results

                        registerCharData(char as CharAddr, data)

                        continue
                    }

                    if (msg.update === 'ScanResult') {
                        const { MAC, Name } = msg.results

                        if (MAC) {
                            console.info('Found a device', msg.results)
                        }

                        if (Name !== 'DE1') {
                            continue
                        }

                        setState((next) => {
                            next.phase = CafeHubPhase.Connecting
                        })

                        setTimeout(async () => {
                            try {
                                await ctrl.send(
                                    {
                                        command: RequestCommand.GATTConnect,
                                        params: {
                                            MAC,
                                        },
                                    },
                                    {
                                        timeoutAfter: 3.6e5,
                                        onBeforeResolve(msg) {
                                            return (
                                                isConnectionStateMessage(msg) &&
                                                msg.results.CState === ConnectionState.Connected
                                            )
                                        },
                                    }
                                )

                                console.info('Connected to DE1', msg.results)
                            } catch (e) {
                                console.warn('GATTConnect failed', msg.results, e)

                                get().disconnect()
                            } finally {
                                setState((next) => {
                                    if (next.phase === CafeHubPhase.Connecting) {
                                        next.phase = undefined
                                    }
                                })
                            }
                        })

                        continue
                    }

                    continue
                }

                if (msg.type === 'RESP') {
                    console.info('Response happened', msg.results)

                    continue
                }
            }

            controller = undefined
        },

        disconnect() {
            controller?.discard()
        },

        write({ char: Char, data }, { timeoutAfter } = {}) {
            const { chConnectionState, wsState, mac: MAC } = get()

            if (
                wsState !== WebSocketState.Open ||
                chConnectionState !== ConnectionState.Connected
            ) {
                throw new Error('Not ready')
            }

            if (!controller) {
                throw new Error('No controller')
            }

            if (!MAC) {
                throw new Error('No MAC')
            }

            return controller.send(
                {
                    command: RequestCommand.GATTWrite,
                    params: {
                        MAC,
                        Char,
                        Data: data.toString('base64'),
                        RR: false,
                    },
                },
                { timeoutAfter }
            )
        },
    }
})

export function useCafeHubStatus() {
    const { wsState, chConnectionState } = useCafeHubStore()

    if (wsState === WebSocketState.Open && chConnectionState === ConnectionState.Connected) {
        return Status.On
    }

    if (wsState !== WebSocketState.Closed) {
        return Status.Busy
    }

    return Status.Off
}

export function usePropertyValue<T extends number | undefined = undefined>(
    property: Property,
    { defaultValue }: { defaultValue?: T } = {}
) {
    const value = useCafeHubStore().machine[property]

    if (typeof value === 'undefined') {
        return defaultValue as T
    }

    return value
}
