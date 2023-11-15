import { Characteristic } from '@abandonware/noble'
import { CharAddr, MMRAddr, Profile, RemoteState } from '../src/types'
import { WebSocketServer } from 'ws'

export {}

declare global {
    namespace Express {
        interface Locals {
            /**
             * State shared between the client and the server.
             */
            remoteState: RemoteState

            /**
             * State of individual characteristic (recent reads). It's also
             * shared with the client but not as part of the general "state".
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

            /**
             * Current set of visible profiles.
             */
            profiles: Profile[] | undefined

            /**
             * Profiles dir. It's different for production and for
             * development so watch out.
             */
            profilesDir: string
        }
    }
}
