import { Characteristic } from '@abandonware/noble'
import { CharAddr, MMRAddr, RemoteState } from '../src/types'
import { WebSocketServer } from 'ws'

export {}

declare global {
    namespace Express {
        interface Locals {
            /**
             * State shared between the client and this server.
             */
            remoteState: RemoteState

            /**
             * Most recent state of each characteristic, updates as we move forward.
             */
            characteristicValues: Partial<Record<CharAddr, string>>

            /**
             * Collection of detected characteristics.
             */
            characteristics: Partial<Record<string, Characteristic>>

            /**
             * Collection of MMR reads.
             */
            mmrData: Partial<Record<MMRAddr, Buffer>>

            /**
             * WebSocket server.
             */
            wss: WebSocketServer
        }
    }
}
