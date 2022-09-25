import AbortError from '$/errors/AbortError'
import { EventEmitter } from 'events'
import connectUtil from './connect'
import delay from './delay'

const ReconnectAfter = {
    Step: 250,
    Max: 10000,
}

export enum EventName {
    Connect = 'connect',
    Data = 'data',
    Disconnect = 'disconnect',
    Error = 'error',
    StateChange = 'stateChange',
    Teardown = 'teardown',
}

export enum ClientState {
    Connected = 'connected',
    Connecting = 'connecting',
    Disconnected = 'disconnected',
}

export default class WebSocketClient {
    private readonly eventEmitter: EventEmitter = new EventEmitter()

    private ws: undefined | WebSocket

    private abortController: undefined | AbortController

    private state: ClientState = ClientState.Disconnected

    getState() {
        return this.state
    }

    private setState(state: ClientState) {
        if (this.state !== state) {
            this.state = state
            this.eventEmitter.emit(EventName.StateChange, state)
        }
    }

    teardown() {
        this.ws?.removeEventListener('message', this.onMessage)

        this.ws?.removeEventListener('close', this.onClose)

        this.ws?.close()

        this.ws = undefined

        this.setState(ClientState.Disconnected)

        this.abortController?.abort()

        this.abortController = new AbortController()

        this.eventEmitter.emit(EventName.Teardown)
    }

    private onMessage = (e: MessageEvent<string>) => {
        let data: undefined | Record<string, unknown>

        try {
            data = JSON.parse(e.data)
        } catch (e) {
            return
        }

        this.eventEmitter.emit(EventName.Data, data)
    }

    private onClose = async (e: CloseEvent) => {
        this.eventEmitter.emit(EventName.Disconnect, e)

        function isWs(target: unknown): target is WebSocket {
            return !!target
        }

        if (isWs(e.currentTarget)) {
            try {
                await this.connect(e.currentTarget.url, {
                    retry: true,
                })
            } catch (e) {
                this.setState(ClientState.Disconnected)
            }
        }
    }

    async connect(
        url: string,
        {
            retry = 0,
        }: {
            retry?: boolean | number
        } = {}
    ) {
        this.teardown()

        this.setState(ClientState.Connecting)

        let ws: WebSocket

        let reanimateAfter: undefined | number

        let retryCount = 0

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                if (typeof reanimateAfter === 'number') {
                    console.info(`Reconnecting in ${reanimateAfter}ms…`)

                    await delay(reanimateAfter, { abortSignal: this.abortController?.signal })
                }

                ws = await connectUtil(url, {
                    abortSignal: this.abortController?.signal,
                    onError: (e: Event) => {
                        this.eventEmitter.emit(EventName.Error, e)
                    },
                })

                this.abortController = undefined

                this.ws = ws

                this.setState(ClientState.Connected)

                this.eventEmitter.emit(EventName.Connect)

                ws.addEventListener('message', this.onMessage)

                ws.addEventListener('close', this.onClose)

                break
            } catch (e) {
                if (e instanceof AbortError) {
                    break
                }

                if (e instanceof CloseEvent) {
                    this.eventEmitter.emit(EventName.Disconnect, e)

                    if (retry === true || (typeof retry === 'number' && retryCount < retry)) {
                        reanimateAfter = Math.min(
                            (reanimateAfter || 0) + ReconnectAfter.Step,
                            ReconnectAfter.Max
                        )

                        retryCount++

                        continue
                    }

                    this.setState(ClientState.Disconnected)
                }

                throw e
            }
        }
    }

    send(data: string) {
        this.ws?.send(data)
    }

    on(eventName: EventName.Connect, listener: () => void): WebSocketClient

    on(
        eventName: EventName.Data,
        listener: (data: Record<string, unknown>) => void
    ): WebSocketClient

    on(eventName: EventName.Disconnect, listener: () => void): WebSocketClient

    on(eventName: EventName.Error, listener: (error: Error) => void): WebSocketClient

    on(eventName: EventName.StateChange, listener: (state: ClientState) => void): WebSocketClient

    on(eventName: EventName.Teardown, listener: () => void): WebSocketClient

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(eventName: EventName, listener: (...args: any[]) => void) {
        this.eventEmitter.on(eventName, listener)

        return this
    }

    once(eventName: EventName.Connect, listener: () => void): WebSocketClient

    once(
        eventName: EventName.Data,
        listener: (data: Record<string, unknown>) => void
    ): WebSocketClient

    once(eventName: EventName.Disconnect, listener: () => void): WebSocketClient

    once(eventName: EventName.Error, listener: (error: Error) => void): WebSocketClient

    once(eventName: EventName.StateChange, listener: (state: ClientState) => void): WebSocketClient

    once(eventName: EventName.Teardown, listener: () => void): WebSocketClient

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(eventName: EventName, listener: (...args: any[]) => void) {
        this.eventEmitter.once(eventName, listener)

        return this
    }

    off(eventName: EventName.Connect, listener: () => void): WebSocketClient

    off(
        eventName: EventName.Data,
        listener: (data: Record<string, unknown>) => void
    ): WebSocketClient

    off(eventName: EventName.Disconnect, listener: () => void): WebSocketClient

    off(eventName: EventName.Error, listener: (error: Error) => void): WebSocketClient

    off(eventName: EventName.StateChange, listener: (state: ClientState) => void): WebSocketClient

    off(eventName: EventName.Teardown, listener: () => void): WebSocketClient

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(eventName: EventName, listener: (...args: any[]) => void) {
        this.eventEmitter.off(eventName, listener)

        return this
    }
}
