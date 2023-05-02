import TimeoutError from '$/errors/TimeoutError'
import { defer } from 'toasterhea'
import { z } from 'zod'

const Message = z.object({
    id: z.number(),
    type: z.literal('REQ').or(z.literal('RESP')).or(z.literal('UPDATE')),
})

export type Message = z.infer<typeof Message>

function isMessage(payload: unknown): payload is Message {
    return Message.safeParse(payload).success
}

const MaxRequestId = 1000000000

interface WebSocketCloseEvent {
    type: 'close'
    payload: CloseEvent
}

interface WebSocketOpenEvent {
    type: 'open'
    payload: Event
}

interface WebSocketErrorEvent {
    type: 'error'
    payload: Event
}

interface WebSocketMessageEvent {
    type: 'message'
    payload: unknown
}

type WebSocketEvent =
    | WebSocketCloseEvent
    | WebSocketErrorEvent
    | WebSocketMessageEvent
    | WebSocketOpenEvent

export enum CharAddr {
    Versions /*       */ = '0000a001-0000-1000-8000-00805f9b34fb', // A R    Versions See T_Versions
    RequestedState /* */ = '0000a002-0000-1000-8000-00805f9b34fb', // B RW   RequestedState See T_RequestedState
    SetTime /*        */ = '0000a003-0000-1000-8000-00805f9b34fb', // C RW   SetTime Set current time
    ShotDirectory /*  */ = '0000a004-0000-1000-8000-00805f9b34fb', // D R    ShotDirectory View shot directory
    ReadFromMMR /*    */ = '0000a005-0000-1000-8000-00805f9b34fb', // E RW   ReadFromMMR Read bytes from data mapped into the memory mapped region.
    WriteToMMR /*     */ = '0000a006-0000-1000-8000-00805f9b34fb', // F W    WriteToMMR Write bytes to memory mapped region
    ShotMapRequest /* */ = '0000a007-0000-1000-8000-00805f9b34fb', // G W    ShotMapRequest Map a shot so that it may be read/written
    DeleteShotRange /**/ = '0000a008-0000-1000-8000-00805f9b34fb', // H W    DeleteShotRange Delete l shots in the range given
    FWMapRequest /*   */ = '0000a009-0000-1000-8000-00805f9b34fb', // I W    FWMapRequest Map a firmware image into MMR. Cannot be done with the boot image
    Temperatures /*   */ = '0000a00a-0000-1000-8000-00805f9b34fb', // J R    Temperatures See T_Temperatures
    ShotSettings /*   */ = '0000a00b-0000-1000-8000-00805f9b34fb', // K RW   ShotSettings See T_ShotSettings
    Deprecated /*     */ = '0000a00c-0000-1000-8000-00805f9b34fb', // L RW   Deprecated Was T_ShotDesc. Now deprecated.
    ShotSample /*     */ = '0000a00d-0000-1000-8000-00805f9b34fb', // M R    ShotSample Use to monitor a running shot. See T_ShotSample
    StateInfo /*      */ = '0000a00e-0000-1000-8000-00805f9b34fb', // N R    StateInfo The current state of the DE1
    HeaderWrite /*    */ = '0000a00f-0000-1000-8000-00805f9b34fb', // O RW   HeaderWrite Use this to change a header in the current shot description
    FrameWrite /*     */ = '0000a010-0000-1000-8000-00805f9b34fb', // P RW   FrameWrite Use this to change a single frame in the current shot description
    WaterLevels /*    */ = '0000a011-0000-1000-8000-00805f9b34fb', // Q RW   WaterLevels Use this to adjust and read water level settings
    Calibration /*    */ = '0000a012-0000-1000-8000-00805f9b34fb', // R RW   Calibration Use this to adjust and read calibration
}

export enum RequestCommand {
    Scan = 'Scan',
    GATTConnect = 'GATTConnect',
    GATTDisconnect = 'GATTDisconnect',
    GATTRead = 'GATTRead',
    GATTSetNotify = 'GATTSetNotify',
    GATTWrite = 'GATTWrite',
}

export interface ScanRequest {
    command: RequestCommand.Scan
    params: {
        Timeout: number
    }
}

export interface GATTConnectRequest {
    command: RequestCommand.GATTConnect
    params: {
        MAC: string
    }
}

export interface GATTDisconnectRequest {
    command: RequestCommand.GATTDisconnect
    params: {
        MAC: string
    }
}

export interface GATTReadRequest {
    command: RequestCommand.GATTRead
    params: {
        MAC: string
        Char: CharAddr
        Len: number
    }
}

export interface GATTWriteRequest {
    command: RequestCommand.GATTWrite
    params: {
        MAC: string
        Char: CharAddr
        Data: string
        RR: boolean
    }
}

export interface GATTSetNotifyRequest {
    command: RequestCommand.GATTSetNotify
    params: {
        MAC: string
        Char: CharAddr
        Enable: boolean
    }
}

type CafeHubRequest =
    | ScanRequest
    | GATTConnectRequest
    | GATTDisconnectRequest
    | GATTReadRequest
    | GATTWriteRequest
    | GATTSetNotifyRequest

type RequestMessage = { id: number; type: 'REQ' } & CafeHubRequest

const UpdateMessage = z.object({
    id: z.number(),
    type: z.literal('UPDATE'),
})

type UpdateMessage = z.infer<typeof UpdateMessage>

export function isUpdateMessage(payload: unknown): payload is UpdateMessage {
    return UpdateMessage.safeParse(payload).success
}

const ScanResultMessage = UpdateMessage.extend({
    update: z.literal('ScanResult'),
    results: z.object({
        MAC: z.string(),
        Name: z.string(),
        UUIDs: z.array(z.string()),
    }),
})

type ScanResultMessage = z.infer<typeof ScanResultMessage>

export function isScanResultMessage(payload: unknown): payload is ScanResultMessage {
    return ScanResultMessage.safeParse(payload).success
}

const GATTNotifyMessage = UpdateMessage.extend({
    update: z.literal('GATTNotify'),
    results: z.object({
        MAC: z.string(),
        Char: z.string(),
        Data: z.string(),
    }),
})

type GATTNotifyMessage = z.infer<typeof GATTNotifyMessage>

export function isGATTNotifyMessage(payload: unknown): payload is GATTNotifyMessage {
    return GATTNotifyMessage.safeParse(payload).success
}

export enum ConnectionState {
    Init = 'INIT',
    Disconnected = 'DISCONNECTED',
    Connected = 'CONNECTED',
    Cancelled = 'CANCELLED',
}

const ConnectionStateMessage = UpdateMessage.extend({
    update: z.literal('ConnectionState'),
    results: z.object({
        MAC: z.string(),
        CState: z
            .literal(ConnectionState.Init)
            .or(z.literal(ConnectionState.Disconnected))
            .or(z.literal(ConnectionState.Connected))
            .or(z.literal(ConnectionState.Cancelled)),
        UUIDs: z.array(z.string()),
    }),
})

type ConnectionStateMessage = z.infer<typeof ConnectionStateMessage>

export function isConnectionStateMessage(payload: unknown): payload is ConnectionStateMessage {
    return ConnectionStateMessage.safeParse(payload).success
}

const ExecutionErrorMessage = UpdateMessage.extend({
    update: z.literal('ExecutionError'),
    results: z.object({
        eid: z.number(),
        errmsg: z.string(),
    }),
})

type ExecutionErrorMessage = z.infer<typeof ExecutionErrorMessage>

export function isExecutionErrorMessage(payload: unknown): payload is ExecutionErrorMessage {
    return ExecutionErrorMessage.safeParse(payload).success
}

const ResponseMessage = z.object({
    id: z.number(),
    type: z.literal('RESP'),
    error: z.object({
        eid: z.number(),
        errmsg: z.string(),
    }),
    results: z.object({
        Data: z.string(),
    }),
})

type ResponseMessage = z.infer<typeof ResponseMessage>

export function isResponseMessage(msg: unknown): msg is ResponseMessage {
    return ResponseMessage.safeParse(msg).success
}

export default function cafehub(url: string) {
    let ws: WebSocket | undefined

    const stream = new ReadableStream<WebSocketEvent>({
        async start(controller: ReadableStreamDefaultController<WebSocketEvent>) {
            ws = new WebSocket(url)

            ws.addEventListener('close', function onClose(e: CloseEvent) {
                controller.enqueue({
                    type: 'close',
                    payload: e,
                })

                controller.close()
            })

            ws.addEventListener('error', function onError(e: Event) {
                controller.enqueue({
                    type: 'error',
                    payload: e,
                })
            })

            ws.addEventListener('message', function onMessage(m: MessageEvent<string>) {
                try {
                    controller.enqueue({
                        type: 'message',
                        payload: JSON.parse(m.data),
                    })
                } catch (e) {
                    console.log('Invalid message', m.data)
                }
            })

            ws.addEventListener('open', function onOpen(e: Event) {
                controller.enqueue({
                    type: 'open',
                    payload: e,
                })
            })
        },
        cancel() {
            ws?.close()
        },
    })

    const reader = stream.getReader()

    let lastKnownRequestId = 0

    function nextRequestId() {
        return (lastKnownRequestId = Math.max(1, (lastKnownRequestId + 1) % MaxRequestId))
    }

    function discard() {
        ws?.close()
    }

    return {
        async read() {
            while (true) {
                const { value, done } = await reader.read()

                if (!value || done) {
                    return
                }

                if (value.type === 'close' || value.type === 'error' || value.type === 'open') {
                    return value
                }

                const { payload: msg } = value

                if (isUpdateMessage(msg)) {
                    if (msg.id === 0) {
                        if (!isGATTNotifyMessage(msg)) {
                            continue
                        }

                        return msg
                    }

                    if (isExecutionErrorMessage(msg)) {
                        /**
                         * From my observation, `ExecutionError` is a good signal to,
                         * well, kill the instance and start over. Sad it makes me.
                         */
                        discard()

                        return msg
                    }

                    if (isConnectionStateMessage(msg)) {
                        const {
                            results: { CState },
                        } = msg
                        if (
                            CState === ConnectionState.Cancelled ||
                            CState === ConnectionState.Disconnected
                        ) {
                            /**
                             * Discard the current instance and clean up. Not much else
                             * we can really do. Thanks Obama!
                             */
                            discard()
                        }

                        return msg
                    }

                    if (isScanResultMessage(msg)) {
                        return msg
                    }

                    continue
                }

                if (isResponseMessage(msg)) {
                    return msg
                }

                continue
            }
        },

        async send(
            data: CafeHubRequest,
            {
                timeoutAfter = 1.2e5,
                onBeforeResolve,
            }: { timeoutAfter?: number; onBeforeResolve?: (msg: Message) => boolean } = {}
        ) {
            if (!ws) {
                throw new Error('No WebSocket instance')
            }

            if (ws.readyState !== ws.OPEN) {
                throw new Error('WebSocket is not ready')
            }

            const d = defer<Message>()

            const payload: RequestMessage = {
                id: nextRequestId(),
                type: 'REQ',
                ...data,
            }

            function onMessage({ data }: MessageEvent<string>) {
                try {
                    const msg = JSON.parse(data)

                    if (!isMessage(msg) || msg.id !== payload.id) {
                        return
                    }

                    if (onBeforeResolve && onBeforeResolve(msg) !== true) {
                        return
                    }

                    ws?.removeEventListener('message', onMessage)

                    d.resolve(msg)
                } catch (e) {
                    // Do nothing.
                }
            }

            function onClose() {
                ws?.removeEventListener('close', onClose)
                ws?.removeEventListener('message', onMessage)

                d.reject(new Error('WebSocket closed'))
            }

            ws.addEventListener('message', onMessage)

            ws.addEventListener('close', onClose)

            ws.send(JSON.stringify(payload))

            return Promise.race([
                d.promise,
                new Promise<Message>(
                    (_, reject) =>
                        void setTimeout(() => void reject(new TimeoutError()), timeoutAfter)
                ),
            ])
        },

        discard,
    }
}

export type CafeHubController = ReturnType<typeof cafehub>
