import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
import { WebSocket, WebSocketServer } from 'ws'

export const wsServer = new WebSocketServer({ noServer: true, path: '/' })

export function upgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit('connection', ws, req)
    })
}

export function send(ws: WebSocket, payload: unknown) {
    ws.send(JSON.stringify(payload))
}

export function broadcast(payload: unknown) {
    wsServer.clients.forEach((ws) => void send(ws, payload))
}
