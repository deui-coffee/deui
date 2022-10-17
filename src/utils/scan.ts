import CafehubClient from 'cafehub-client'
import {
    ConnectionState,
    Device,
    isScanResultUpdate,
    RequestCommand,
    UpdateMessage,
} from 'cafehub-client/types'

interface Options {
    timeout?: number
}

export default async function scan(client: CafehubClient, { timeout = 10 }: Options = {}) {
    const msg: UpdateMessage = await client.sendRequest(
        {
            command: RequestCommand.Scan,
            params: {
                Timeout: timeout,
            },
        },
        {
            resolveIf(msg) {
                if (!isScanResultUpdate(msg)) {
                    return false
                }

                return !msg.results.MAC || msg.results.Name === 'DE1'
            },
        }
    )

    if (!isScanResultUpdate(msg)) {
        return null
    }

    const device: Device = {
        ...msg.results,
        connectionState: ConnectionState.Disconnected,
    }

    return device.MAC ? device : null
}
