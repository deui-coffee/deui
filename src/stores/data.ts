import { Status } from '$/components/StatusIndicator'
import { MajorState } from '$/consts'
import {
    BluetoothState,
    ChunkType,
    MachineMode,
    Prop,
    Properties,
    RemoteState,
    WebSocketState,
    isPropertiesMessage,
    isStateMessage,
} from '$/types'
import wsStream, { WsController } from '$/utils/wsStream'
import axios from 'axios'
import { produce } from 'immer'
import { useEffect } from 'react'
import { create } from 'zustand'

export async function exec(command: string) {
    switch (command) {
        case 'scan':
        case 'on':
        case 'off':
            await axios.post(`/${command}`)
            break
        default:
            throw new Error('Unknown command')
    }
}

interface DataStore {
    wsState: WebSocketState

    remoteState: RemoteState

    properties: Properties

    connect: () => Promise<void>

    disconnect: () => void
}

function getDefaultRemoteState(): RemoteState {
    return {
        bluetoothState: BluetoothState.Unknown,
        scanning: false,
        connecting: false,
        discoveringCharacteristics: false,
        device: undefined,
    }
}

function getDefaultProperties(): Properties {
    return {
        [Prop.WaterCapacity]: 1500,
    }
}

export const useDataStore = create<DataStore>((set) => {
    let ctrl: WsController | undefined

    return {
        wsState: WebSocketState.Closed,

        remoteState: getDefaultRemoteState(),

        properties: getDefaultProperties(),

        async connect() {
            ctrl?.discard()

            set({ wsState: WebSocketState.Opening })

            ctrl = wsStream(`ws://${location.hostname}:3001`)

            while (true) {
                const chunk = await ctrl.read()

                if (!chunk) {
                    /**
                     * This should be impossible because we break this while
                     * on `ws:close`. Either way, we can catch that outside.
                     */
                    throw new Error('Invalid chunk')
                }

                if (chunk.type === ChunkType.WebSocketClose) {
                    set({
                        wsState: WebSocketState.Closed,
                        remoteState: getDefaultRemoteState(),
                        properties: getDefaultProperties(),
                    })

                    break
                }

                if (chunk.type === ChunkType.WebSocketOpen) {
                    set({ wsState: WebSocketState.Open })

                    setTimeout(async () => {
                        try {
                            await exec('scan')
                        } catch (e) {
                            console.warn('Scan failed')
                        }
                    })

                    continue
                }

                if (chunk.type === ChunkType.WebSocketError) {
                    console.warn('WebSocker errored', chunk.payload)

                    continue
                }

                const { payload: data } = chunk

                if (isStateMessage(data)) {
                    set({ remoteState: data.payload })

                    continue
                }

                if (isPropertiesMessage(data)) {
                    set((current) =>
                        produce(current, (next) => {
                            Object.assign(next.properties, data.payload)
                        })
                    )

                    continue
                }
            }

            ctrl = undefined
        },

        disconnect() {
            ctrl?.discard()

            ctrl = undefined
        },
    }
})

export function useIsOn() {
    const { [Prop.MajorState]: majorState = 0 } = useDataStore().properties

    return majorState !== 0
}

export function useStatus() {
    const { wsState, remoteState } = useDataStore()

    if (wsState === WebSocketState.Closed) {
        return Status.Off
    }

    if (remoteState.device) {
        return Status.On
    }

    return Status.Busy
}

export function useAutoConnectEffect() {
    const { connect, disconnect } = useDataStore()

    useEffect(() => {
        async function fn() {
            try {
                await connect()
            } catch (e) {
                console.warn('Connect failed', e)
            }
        }

        fn()

        return disconnect
    }, [disconnect, connect])
}

export function usePropValue(prop: Prop) {
    return useDataStore().properties[prop]
}

export function useMajorState() {
    return usePropValue(Prop.MajorState)
}

export function useMinorState() {
    return usePropValue(Prop.MinorState)
}

export function useWaterLevel() {
    return usePropValue(Prop.WaterLevel)
}

export function usePhase() {
    const { wsState, remoteState } = useDataStore()

    const status = useStatus()

    if (status !== Status.Busy) {
        return
    }

    if (wsState === WebSocketState.Opening) {
        return 'Opening…'
    }

    if (remoteState.scanning) {
        return 'Looking for DE1…'
    }

    if (remoteState.connecting) {
        return 'Connecting to DE1…'
    }
}

export function useMachineMode() {
    const majorState = useMajorState()

    switch (majorState) {
        case MajorState.Steam:
            return MachineMode.Steam
        case MajorState.HotWater:
            return MachineMode.Water
        case MajorState.Clean:
            return MachineMode.Flush
        case MajorState.Espresso:
        default:
            return MachineMode.Espresso
    }
}
