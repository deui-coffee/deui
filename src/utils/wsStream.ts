import { Chunk, ChunkType } from '$/types'

export interface WsController {
    read: () => Promise<Chunk | undefined>
    discard: () => void
}

export default function wsStream(url: string): WsController {
    let ws: WebSocket | undefined

    const stream = new ReadableStream<Chunk>({
        async start(controller: ReadableStreamDefaultController<Chunk>) {
            ws = new WebSocket(url)

            ws.addEventListener('close', function onClose(e: CloseEvent) {
                controller.enqueue({
                    type: ChunkType.WebSocketClose,
                    payload: e,
                })

                controller.close()
            })

            ws.addEventListener('error', function onError(e: Event) {
                controller.enqueue({
                    type: ChunkType.WebSocketError,
                    payload: e,
                })
            })

            ws.addEventListener('message', function onMessage(m: MessageEvent<string>) {
                try {
                    controller.enqueue({
                        type: ChunkType.WebSocketMessage,
                        payload: JSON.parse(m.data),
                    })
                } catch (e) {
                    console.warn('Invalid JSON', e, m.data)
                }
            })

            ws.addEventListener('open', function onOpen(e: Event) {
                controller.enqueue({
                    type: ChunkType.WebSocketOpen,
                    payload: e,
                })
            })
        },
        cancel() {
            ws?.close()
        },
    })

    const reader = stream.getReader()

    return {
        async read() {
            return (await reader.read()).value
        },

        discard() {
            ws?.close()
        },
    }
}
