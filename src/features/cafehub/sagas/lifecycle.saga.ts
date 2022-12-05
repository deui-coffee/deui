import { CafeHubAction } from '$/features/cafehub'
import { Phase } from '$/features/cafehub/types'
import CafeHub, { Manifest, ManifestType } from '$/features/cafehub/utils/CafeHub'
import { AbortError, MachineNotFoundError } from 'cafehub-client/errors'
import {
    CharAddr,
    ConnectionState,
    Device,
    isConnectionStateUpdate,
    isScanResultUpdate,
    RequestCommand,
} from 'cafehub-client/types'
import { Task } from 'redux-saga'
import { call, cancelled, fork, put, race, take } from 'redux-saga/effects'

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
                            yield put(CafeHubAction.notification(msg.payload))
                            break
                        case ManifestType.Update:
                            yield put(CafeHubAction.update(msg.payload))
                            break
                        case ManifestType.ConnectionState:
                            yield put(CafeHubAction.connectionState(msg.payload))
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
                ch.cancel()
            }
        }
    })
}

function scan(ch: CafeHub) {
    return call(function* () {
        let device: Device | undefined

        while (true) {
            try {
                // This will explode with `AbortError` if `cancelScan` is dispatched first.
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
                                            return isScanResultUpdate(msg) && !msg.results.MAC
                                        },
                                    }
                                )

                                yield put(CafeHubAction.scanComplete)
                            } finally {
                                if ((yield cancelled()) as boolean) {
                                    abortController.abort()
                                }
                            }
                        }),
                        take(CafeHubAction.cancelScan),
                    ])
                })

                // This will explode if `scanComplete` happens before DE1 machine is found.
                yield fork(function* () {
                    yield race([
                        call(function* () {
                            yield take(CafeHubAction.scanComplete)

                            throw new MachineNotFoundError()
                        }),
                        take(CafeHubAction.device),
                    ])
                })

                device = yield take(CafeHubAction.device)

                break
            } catch (e) {
                if (e instanceof MachineNotFoundError) {
                    yield race([
                        call(function* () {
                            yield take(CafeHubAction.cancelScan)

                            throw new AbortError()
                        }),
                        take(CafeHubAction.reScan),
                    ])

                    // Back to the top of the pre-scan `while` loop.
                    continue
                }

                throw e
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
    return call(function* () {
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
        } catch (e) {
            if (e instanceof AbortError) {
                return
            }

            throw e
        } finally {
            if ((yield cancelled()) as boolean) {
                abortController.abort()
            }
        }
    })
}

function requestNotifications(ch: CafeHub, device: Device) {
    return fork(function* () {
        let recentState

        let tasks: Task[] = []

        while (true) {
            const {
                payload: {
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

            tasks.forEach((task) => {
                task.cancel()
            })

            tasks = []

            if (connectionState !== ConnectionState.Connected) {
                yield phase(Phase.Unpaired)

                continue
            }

            yield phase(Phase.Paired)

            tasks.push(
                yield fork(function* () {
                    yield subscribeToNotifications(ch, device, CharAddr.WaterLevels)

                    yield subscribeToNotifications(ch, device, CharAddr.Temperatures)
                })
            )

            tasks.push(
                yield fork(function () {
                    // takeEvery GATT write and dispatch a write.
                })
            )
        }
    })
}

function pair(ch: CafeHub, device: Device) {
    return call(function* () {
        yield requestNotifications(ch, device)

        while (true) {
            yield call(function* () {
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
            })

            const decision: Record<'abort' | 'pair', unknown> = yield race({
                abort: take(CafeHubAction.cancelPair),
                pair: take(CafeHubAction.pair),
            })

            if ('abort' in decision) {
                // Don't pair again.
                break
            }
        }
    })
}

function phase(phase: Phase) {
    return put(CafeHubAction.setPhase(phase))
}

export default function* lifecycle() {
    while (true) {
        yield phase(Phase.Idle)

        const { payload: url }: ReturnType<typeof CafeHubAction.connect> = yield take(
            CafeHubAction.connect
        )

        yield phase(Phase.Connecting)

        // This will not block.
        yield connect(url)

        // Wait for `close` AND `open`. `close` = WebSocket is down = cancel everything else.
        yield race([
            take(CafeHubAction.close),
            call(function* () {
                const ch: CafeHub = yield take(CafeHubAction.open)

                yield phase(Phase.Scanning)

                try {
                    // Once we know the WebSocket is open we can scan for a DE1 machine.
                    const device: Device | undefined = yield scan(ch)

                    if (!device) {
                        // A clean no-device-found situation is only possible if the `scan` itself
                        // was cancelled from the outside, meaning, anything further won't be
                        // called either. The following should never happen.
                        throw new Error('No device found')
                    }

                    yield phase(Phase.Pairing)

                    // With a proper device we can proceed to pairing. Pairing here means connecting
                    // CafeHub instance to the actual DE1 machine. The following will block the flow
                    // until get a clear disconnect instruction.
                    yield pair(ch, device)

                    // The user no longer wants CafeHub and DE1 connected. Let's dc.
                    ch.cancel()
                } catch (e) {
                    if (e instanceof AbortError) {
                        // Eventually calls `CafeHubAction.close`.
                        ch.cancel()
                    }

                    throw e
                }
            }),
        ])
    }
}
