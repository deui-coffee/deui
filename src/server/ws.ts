import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
import { WebSocketServer } from 'ws'

export const wsServer = new WebSocketServer({ noServer: true, path: '/' })

export function upgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit('connection', ws, req)
    })
}

export function broadcast(payload: unknown) {
    wsServer.clients.forEach((ws) => {
        ws.send(JSON.stringify(payload))
    })
}
