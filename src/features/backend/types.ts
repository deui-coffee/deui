import WebSocketClient from '$/utils/ws-client'

export interface BackendState {
    url: string
    client: WebSocketClient
}
