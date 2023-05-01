import { CafeHubAction } from '$/features/cafehub'
import { Phase } from '$/features/cafehub/types'
import CafeHub, { Manifest, ManifestType } from '$/features/cafehub/utils/CafeHub'
import { MiscAction } from '$/features/misc'
import selectCafeHubRecentMAC from '$/selectors/selectCafeHubRecentMAC'
import handleError from '$/utils/handleError'
import AbortError from '$/errors/AbortError'
import MachineNotFoundError from '$/errors/MachineNotFoundError'
import {
    CharAddr,
    ConnectionState,
    Device,
    GATTReadResponse,
    isConnectionStateUpdate,
    isScanResultUpdate,
    isUpdateMessage,
    RequestCommand,
} from '$/features/cafehub/utils/types'
import { Task } from 'redux-saga'
import { call, cancelled, fork, put, race, select, take, takeEvery } from 'redux-saga/effects'

function connect(url: string) {
    return fork(function* () {
        const ch = new CafeHub(url)

        try {
            while (true) {
                const { value: msg, done }: ReadableStreamReadResult<Manifest> = yield ch.read()

                if (msg) {
                    switch (msg.type) {
                        case ManifestType.Open:
                            yield put(CafeHubAction.open(ch))
                            break
                        case ManifestType.Error:
                            yield put(CafeHubAction.error(msg.payload))
                            break
                        case ManifestType.Close:
                            yield put(CafeHubAction.close(msg.payload))
                            break
                        case ManifestType.Device:
                            yield put(CafeHubAction.device(msg.payload))
                            break
                        case ManifestType.Notification:
                            yield put(
                                CafeHubAction.store({
                                    char: msg.payload.results.Char,
                                    data: msg.payload.results.Data,
                                })
                            )
                            break
                        case ManifestType.Update:
                            yield put(CafeHubAction.update(msg.payload))
                            break
                        case ManifestType.ConnectionState:
                            yield put(CafeHubAction.connectionState(msg.payload))
                            break
                        case ManifestType.ExecutionError:
                            yield put(CafeHubAction.execError(msg.payload))
                            break
                        default:
                    }
                }

                if (done) {
                    break
                }
            }
        } finally {
            if ((yield cancelled()) as boolean) {
                ch.close()
            }
        }
    })
}

function is<T>(arg: unknown): arg is T {
    return !!arg
}

function scan(ch: CafeHub) {
    return call(function* () {
        let device: Device | undefined

        let attempts = 0

        while (true) {
            yield phase(Phase.Scanning)

            if (attempts > 0) {
                yield dattDisconnectRecentMAC(ch)
            }

            try {
                yield fork(function* () {
                    yield race([
                        call(function* () {
                            const abortController = new AbortController()

                            try {
                                yield ch.request(
                                    {
                                        command: RequestCommand.Scan,
                                        params: {
                                            Timeout: 20,
                                        },
                                    },
                                    {
                                        abort: abortController.signal,
                                        resolveIf(msg) {
                                            return isUpdateMessage(msg) && isScanResultUpdate(msg) && msg.results.Name === 'DE1'
                                        },
                                    }
                                )

                                yield put(CafeHubAction.scanComplete())
                            } catch (e) {
                                // If we get cancelled from the outside this error handler will be
                                // entirely ignored. Only failures coming from within are
                                // caught here.
                                yield put(CafeHubAction.scanFailed())
                            } finally {
                                if ((yield cancelled()) as boolean) {
                                    abortController.abort()
                                }
                            }
                        }),
                        take(CafeHubAction.abort),
                    ])
                })

                const { found }: Record<'failed' | 'completed' | 'found' | 'abort', unknown> =
                    yield race({
                        failed: take(CafeHubAction.scanFailed),
                        completed: take(CafeHubAction.scanComplete),
                        found: take(CafeHubAction.device),
                        abort: take(CafeHubAction.abort),
                    })
                
                if (is<ReturnType<typeof CafeHubAction.device>>(found)) {
                    device = found.payload
                    break
                }

                yield phase(Phase.Unscanned)

                const { retry }: Record<'retry' | 'abort', unknown> = yield race({
                    retry: take(CafeHubAction.scan),
                    abort: take(CafeHubAction.abort),
                })

                attempts++

                if (is<ReturnType<typeof CafeHubAction.scan>>(retry)) {
                    continue
                }

                throw new MachineNotFoundError()
            } finally {
                if ((yield cancelled()) as boolean) {
                    // eslint-disable-next-line no-unsafe-finally
                    break
                }
            }
        }

        return device
    })
}

function subscribeToNotifications(ch: CafeHub, device: Device, char: CharAddr) {
    return fork(function* () {
        const abortController = new AbortController()

        try {
            yield ch.request(
                {
                    command: RequestCommand.GATTSetNotify,
                    params: {
                        Char: char,
                        Enable: true,
                        MAC: device.MAC,
                    },
                },
                {
                    abort: abortController.signal,
                }
            )
        } finally {
            if ((yield cancelled()) as boolean) {
                abortController.abort()
            }
        }
    })
}

function readCharacteristic(ch: CafeHub, device: Device, char: CharAddr) {
    return fork(function* () {
        const abortController = new AbortController()

        try {
            const resp: GATTReadResponse = yield ch.request(
                {
                    command: RequestCommand.GATTRead,
                    params: {
                        MAC: device.MAC,
                        Char: char,
                        Len: 0,
                    },
                },
                {
                    abort: abortController.signal,
                }
            )

            yield put(
                CafeHubAction.store({
                    char,
                    data: resp.results.Data,
                })
            )
        } finally {
            if ((yield cancelled()) as boolean) {
                abortController.abort()
            }
        }
    })
}

function gattDisconnect(ch: CafeHub, mac: string) {
    return call(function* () {
        const abortController = new AbortController()

        try {
            yield ch.request(
                {
                    command: RequestCommand.GATTDisconnect,
                    params: {
                        MAC: mac,
                    },
                },
                {
                    abort: abortController.signal,
                }
            )

            yield put(CafeHubAction.setRecentMAC(undefined))
        } catch (e) {
            handleError(e)
        } finally {
            if ((yield cancelled()) as boolean) {
                abortController.abort()
            }
        }
    })
}

function dattDisconnectRecentMAC(ch: CafeHub) {
    return call(function* () {
        const mac: undefined | string = yield select(selectCafeHubRecentMAC)

        if (!mac) {
            return
        }

        yield gattDisconnect(ch, mac)
    })
}

function watchConnection(ch: CafeHub, device: Device) {
    return fork(function* () {
        const { abort }: Record<'abort' | 'watch', unknown> = yield race({
            abort: take(CafeHubAction.unpair),
            watch: call(function* () {
                let recentState

                let tasks: Task[] = []

                let connectorRequestId: undefined | number

                while (true) {
                    const {
                        payload: {
                            id,
                            results: { MAC: mac, CState: connectionState },
                        },
                    }: ReturnType<typeof CafeHubAction.connectionState> = yield take(
                        CafeHubAction.connectionState
                    )

                    if (device.MAC !== mac) {
                        continue
                    }

                    if (recentState === connectionState) {
                        continue
                    }

                    recentState = connectionState

                    if (connectionState === ConnectionState.Connected) {
                        connectorRequestId = id
                    }

                    if (connectorRequestId !== id) {
                        // Skip connection state changes that were caused by requests that have
                        // not resolved to establish a connection.
                        continue
                    }

                    tasks.forEach((task) => {
                        task.cancel()
                    })

                    tasks = []

                    if (connectionState !== ConnectionState.Connected) {
                        yield put(CafeHubAction.setRecentMAC(undefined))

                        yield phase(Phase.Unpaired)

                        continue
                    }

                    yield phase(Phase.Paired)

                    connectorRequestId = id

                    yield put(CafeHubAction.setRecentMAC(device.MAC))

                    yield put(MiscAction.setIsEditingBackendUrl(false))

                    const chars = [
                        CharAddr.WaterLevels,
                        CharAddr.Temperatures,
                        CharAddr.StateInfo,
                        CharAddr.HeaderWrite,
                        CharAddr.FrameWrite,
                    ]

                    for (let i = 0; i < chars.length; i++) {
                        tasks.push(yield subscribeToNotifications(ch, device, chars[i]))

                        tasks.push(yield readCharacteristic(ch, device, chars[i]))
                    }

                    tasks.push(
                        yield fork(function* () {
                            while (true) {
                                yield take(CafeHubAction.abort)

                                yield put(MiscAction.setIsEditingBackendUrl(false))
                            }
                        })
                    )

                    tasks.push(
                        yield fork(function* () {
                            yield takeEvery(
                                CafeHubAction.write,
                                function* ({
                                    payload: { char: Char, data },
                                }: ReturnType<typeof CafeHubAction.write>) {
                                    const abortController = new AbortController()

                                    try {
                                        yield ch.request(
                                            {
                                                command: RequestCommand.GATTWrite,
                                                params: {
                                                    MAC: device.MAC,
                                                    Char,
                                                    Data: data.toString('base64'),
                                                    RR: false,
                                                },
                                            },
                                            {
                                                abort: abortController.signal,
                                            }
                                        )
                                    } finally {
                                        if ((yield cancelled()) as boolean) {
                                            abortController.abort()
                                        }
                                    }
                                }
                            )
                        })
                    )

                    tasks.push(
                        yield fork(function* () {
                            while (true) {
                                const { payload }: ReturnType<typeof CafeHubAction.raw> =
                                    yield take(CafeHubAction.raw)

                                try {
                                    ch.send(JSON.stringify(payload))
                                } catch (e) {
                                    handleError(e)
                                }
                            }
                        })
                    )
                }
            }),
        })

        if (!abort) {
            return
        }

        yield phase(Phase.Disconnecting)

        yield gattDisconnect(ch, device.MAC)

        yield put(CafeHubAction.close(null))
    })
}

function requestPair(ch: CafeHub, device: Device) {
    // This will make an attempt to connect DE1 and CH, and if they're already connected
    // from before, it'll clean that up (dc) and connect them again. Cool, eh? On paper.

    return call(function* () {
        let attempts = 0

        while (true) {
            const result: Record<'clean' | 'dirty', unknown> = yield race({
                dirty: call(function* () {
                    while (true) {
                        const {
                            payload: {
                                results: { eid },
                            },
                        }: ReturnType<typeof CafeHubAction.execError> = yield take(
                            CafeHubAction.execError
                        )

                        if (eid === 6) {
                            // CH and DE1 are already paired before we even started. A no-no.
                            break
                        }
                    }
                }),
                clean: call(function* () {
                    const abortController = new AbortController()

                    try {
                        yield ch.request(
                            {
                                command: RequestCommand.GATTConnect,
                                params: {
                                    MAC: device.MAC,
                                },
                            },
                            {
                                abort: abortController.signal,
                                resolveIf(msg) {
                                    return (
                                        isUpdateMessage(msg) &&
                                        isConnectionStateUpdate(msg) &&
                                        msg.results.CState === ConnectionState.Disconnected
                                    )
                                },
                            }
                        )
                    } finally {
                        if ((yield cancelled()) as boolean) {
                            abortController.abort()
                        }
                    }
                }),
            })

            if ('clean' in result || attempts === 1) {
                break
            }

            console.log('DC?')

            // We've detected an old connection betweeb CH and DE1. Let's disconnect it and
            // try to connect them again (it's a `while` loop, still).
            yield gattDisconnect(ch, device.MAC)

            attempts++
        }
    })
}

function pair(ch: CafeHub, device: Device) {
    return call(function* () {
        const task: Task = yield watchConnection(ch, device)

        while (true) {
            yield phase(Phase.Pairing)

            yield requestPair(ch, device)

            const { abort }: Record<'abort' | 'pair', unknown> = yield race({
                abort: take(CafeHubAction.abort),
                pair: take(CafeHubAction.pair),
            })

            if (!is<ReturnType<typeof CafeHubAction.abort>>(abort)) {
                // Pair again!
                continue
            }

            // Cancel all outstanding forks. Otherwise this saga won't end for millennia.
            task.cancel()

            break
        }
    })
}

function phase(phase: Phase) {
    return put(CafeHubAction.setPhase(phase))
}

function waitForURL() {
    return call(function* () {
        const { connect }: Record<'connect' | 'abort', unknown> = yield race({
            connect: take(CafeHubAction.connect),
            abort: take(CafeHubAction.abort),
        })

        if (!is<ReturnType<typeof CafeHubAction.connect>>(connect)) {
            throw new AbortError()
        }

        return connect.payload
    })
}

export default function* lifecycle() {
    while (true) {
        yield phase(Phase.Disconnected)

        let url: string

        try {
            url = yield waitForURL()
        } catch (e) {
            if (e instanceof AbortError) {
                // This will automatically reset the transient backend URL.
                yield put(MiscAction.setIsEditingBackendUrl(false))

                continue
            }

            throw e
        }

        // Let's store the recent URL.
        yield put(MiscAction.setBackendUrl(url))

        yield phase(Phase.Connecting)

        // This will not block.
        yield connect(url)

        // Wait for `close` AND `open`. `close` = WebSocket is down = cancel everything else.
        yield race([
            take(CafeHubAction.close),
            call(function* () {
                let teardown: undefined | (() => void)

                try {
                    const { payload: ch }: ReturnType<typeof CafeHubAction.open> = yield take(
                        CafeHubAction.open
                    )

                    teardown = () => {
                        ch.close()
                    }

                    // Once we know the WebSocket is open we can scan for a DE1 machine.
                    const device: Device | undefined = yield scan(ch)

                    console.log('FOUND', device)

                    if (!device) {
                        // A clean no-device-found situation is only possible if the `scan` itself
                        // was cancelled from the outside, meaning, anything further won't be
                        // called either. The following should never happen.
                        throw new Error('No device found')
                    }

                    // With a proper device we can proceed to pairing. Pairing here means connecting
                    // CafeHub instance to the actual DE1 machine. The following will block the flow
                    // until get a clear disconnect instruction.
                    yield pair(ch, device)

                    // The user no longer wants CafeHub and DE1 connected. Let's dc.
                    ch.close()
                } catch (e) {
                    handleError(e)
                } finally {
                    if ((yield cancelled()) as boolean) {
                        if (teardown) {
                            teardown()
                        }
                    }
                }
            }),
        ])
    }
}
