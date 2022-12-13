import { AbortError, SocketNotReadyError, TimeoutError } from 'cafehub-client/errors'
import {
    ConnectionState,
    ConnectionStateUpdate,
    Defer,
    Device,
    GATTNotifyUpdate,
    isConnectionStateUpdate,
    isGATTNotifyUpdate,
    isScanResultUpdate,
    isUpdateMessage,
    MessageType,
    RawMessage,
    Request,
    RequestMessage,
    Requests,
    SendOptions,
    UpdateMessage,
} from 'cafehub-client/types'
import { defer, delay } from 'cafehub-client/utils'

const DEBUG = false

function debug(...args: unknown[]) {
    if (DEBUG) {
        console.log(...args)
    }
}

export enum ManifestType {
    Open = 'open',
    Close = 'close',
    Error = 'error',
    Notification = 'notification',
    Device = 'device',
    Update = 'update',
    ConnectionState = 'connectionState',
}

interface OpenManifest {
    type: ManifestType.Open
}

interface CloseManifest {
    type: ManifestType.Close
    payload: CloseEvent
}

interface ErrorManifest {
    type: ManifestType.Error
    payload: Event
}

interface NotificationManifest {
    type: ManifestType.Notification
    payload: GATTNotifyUpdate
}

interface DeviceManifest {
    type: ManifestType.Device
    payload: Device
}

interface UpdateManifest {
    type: ManifestType.Update
    payload: UpdateMessage
}

interface ConnectionStateManifest {
    type: ManifestType.ConnectionState
    payload: ConnectionStateUpdate
}

export type Manifest =
    | OpenManifest
    | CloseManifest
    | ErrorManifest
    | NotificationManifest
    | DeviceManifest
    | UpdateManifest
    | ConnectionStateManifest

const MaxRequestId = 1000000000

export default class CafeHub {
    private ws: undefined | WebSocket = undefined

    private nextRequestId: () => number = () => 0

    private requests: Requests = {}

    private rs: ReadableStream

    private reader: ReadableStreamDefaultReader

    constructor(url: string) {
        const start = (controller: ReadableStreamDefaultController<Manifest>) => {
            this.ws = new WebSocket(`ws://${url}`)

            this.ws.addEventListener('open', () => {
                controller.enqueue({
                    type: ManifestType.Open,
                })
            })

            this.ws.addEventListener('close', (payload: CloseEvent) => {
                controller.enqueue({
                    type: ManifestType.Close,
                    payload,
                })

                controller.close()
            })

            this.ws.addEventListener('error', (payload: Event) => {
                controller.enqueue({
                    type: ManifestType.Error,
                    payload,
                })
            })

            this.ws.addEventListener('message', (e: MessageEvent<string>) => {
                debug('RECV', e.data)

                let payload: undefined | RawMessage

                try {
                    payload = JSON.parse(e.data)
                } catch (e) {
                    // Ignore.
                }

                if (!payload || payload !== Object(payload)) {
                    // Filter out primitives.
                    return
                }

                if (!isUpdateMessage(payload)) {
                    return
                }

                if (payload.id === 0) {
                    if (!isGATTNotifyUpdate(payload)) {
                        return
                    }

                    controller.enqueue({
                        type: ManifestType.Notification,
                        payload,
                    })

                    return
                }

                if (!this.requests[payload.id]) {
                    // We don't have a record of sending a message with this `id`.
                    return
                }

                // *Try* to resolve associated `sendRequest` promise. Possibly a noop, see `resolveIf`.
                this.requests[payload.id].resolve(payload)

                if (isConnectionStateUpdate(payload)) {
                    controller.enqueue({
                        type: ManifestType.ConnectionState,
                        payload: payload,
                    })

                    return
                }

                if (isScanResultUpdate(payload)) {
                    if (payload.results.MAC && payload.results.Name === 'DE1') {
                        controller.enqueue({
                            type: ManifestType.Device,
                            payload: {
                                ...payload.results,
                                connectionState: ConnectionState.Disconnected,
                            },
                        })
                    }

                    return
                }

                controller.enqueue({
                    type: ManifestType.Update,
                    payload,
                })
            })
        }

        const cancel = () => {
            this.ws?.close()
        }

        this.rs = new ReadableStream({
            start,
            cancel,
        })

        this.reader = this.rs.getReader()

        let requestId = 0

        this.nextRequestId = () => {
            return (requestId = Math.max(1, (requestId + 1) % MaxRequestId))
        }
    }

    close() {
        this.ws?.close()
    }

    async read() {
        return this.reader.read()
    }

    send(data: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new SocketNotReadyError()
        }

        this.ws.send(data)

        debug('SEND', data)
    }

    async request(data: Request, { timeout, resolveIf, onBeforeSend, abort }: SendOptions = {}) {
        const payload: RequestMessage = {
            ...data,
            id: this.nextRequestId(),
            type: MessageType.Request,
        }

        const { resolve, reject, promise } = await defer<UpdateMessage>()

        const settlers: Defer = {
            resolve(msg: UpdateMessage) {
                if (msg.id !== payload.id) {
                    return
                }

                if (typeof resolveIf === 'function') {
                    if (resolveIf(msg)) {
                        resolve(msg)
                    }

                    return
                }

                resolve(msg)
            },
            reject,
        }

        Object.assign(this.requests, {
            [payload.id]: settlers,
        })

        abort?.addEventListener('abort', () => {
            reject(new AbortError())
        })

        try {
            if (typeof onBeforeSend === 'function') {
                onBeforeSend(payload)
            }

            // If the client isn't ready this will throw.
            this.send(JSON.stringify(payload))

            if (!timeout) {
                return await promise
            } else {
                return await Promise.race([
                    promise,
                    delay(Math.max(0, timeout)).then(() => {
                        throw new TimeoutError()
                    }),
                ])
            }
        } catch (e) {
            // Proactively reject the outstanding settler. Not bad to call it twice.
            reject(e)

            throw e
        } finally {
            delete this.requests[payload.id]
        }
    }
}
