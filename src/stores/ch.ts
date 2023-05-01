import cafehub, {
    CafeHubController,
    CharAddr,
    ConnectionState,
    RequestCommand,
    isConnectionStateMessage,
    isScanResultMessage,
} from '$/utils/cafehub'
import { produce } from 'immer'
import { create } from 'zustand'

enum WebSocketState {
    Opening = 'opening',
    Open = 'open',
    Closed = 'closed',
}

interface CafeHubStore {
    url: string

    wsState: WebSocketState

    chConnectionState: ConnectionState

    mac: string | undefined

    connect: (url: string) => Promise<void>
}

export const useCafeHubStore = create<CafeHubStore>((set, get) => {
    let controller: CafeHubController | undefined

    function setState(updater: (next: CafeHubStore) => void) {
        set((current) => produce(current, updater))
    }

    return {
        url: '',

        wsState: WebSocketState.Closed,

        chConnectionState: ConnectionState.Disconnected,

        mac: undefined,

        async connect(url) {
            if (controller) {
                return
            }

            setState((next) => {
                next.url = url

                next.wsState = WebSocketState.Opening
            })

            const ctrl = (controller = cafehub(url))

            while (true) {
                const msg = await ctrl.read()

                if (!msg) {
                    /**
                     * @TBD Does it mean `WebSocketState.Closed`, too? Or do we get
                     * the `close` message separately?
                     */
                    break
                }

                if (msg.type === 'open') {
                    setState((next) => {
                        next.wsState = WebSocketState.Open
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
                                }
                            )

                            console.info('DE1 found')
                        } catch (e) {
                            console.warn('RequestCommand.Scan failed', e)
                        }
                    })

                    continue
                }

                if (msg.type === 'close') {
                    setState((next) => {
                        next.wsState = WebSocketState.Closed

                        next.chConnectionState = ConnectionState.Disconnected

                        next.mac = undefined
                    })

                    continue
                }

                if (msg.type === 'error') {
                    console.warn('Error happened', msg.payload)

                    continue
                }

                if (msg.type === 'UPDATE') {
                    if (msg.update === 'ConnectionState') {
                        const { CState, MAC } = msg.results

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
                            }
                        })

                        continue
                    }

                    continue
                }

                if (msg.type === 'RESP') {
                    continue
                }
            }

            controller = undefined
        },
    }
})
