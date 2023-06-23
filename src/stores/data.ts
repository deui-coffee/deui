import { Status } from '$/components/StatusIndicator'
import toml from 'toml'
import {
    CharAddr,
    MajorState,
    ProfileManifest,
    ShotExtensionFrame,
    ShotFrame,
    ShotHeader,
    isCharMessage,
    isProfile,
} from '$/types'
import {
    BluetoothState,
    ChunkType,
    MachineMode,
    Profile,
    Prop,
    Properties,
    RemoteState,
    WebSocketState,
    isStateMessage,
} from '$/types'
import wsStream, { WsController } from '$/utils/wsStream'
import axios from 'axios'
import { produce } from 'immer'
import { useEffect } from 'react'
import { create } from 'zustand'
import { Buffer } from 'buffer'
import { fromF817 } from '$/server/utils'
import { decodeShotFrame, decodeShotHeader } from '$/utils/shot'

interface WriteShotCommand {
    method: 'exec_writeShot'
    params: Buffer[]
}

type ExecCommand = 'scan' | 'on' | 'off' | WriteShotCommand

export async function exec(command: ExecCommand) {
    switch (command) {
        case 'scan':
        case 'on':
        case 'off':
            await axios.post(`/${command}`)
            break
        default:
            await axios.post(`/exec`, command.params)
    }
}

interface DataStore {
    wsState: WebSocketState

    remoteState: RemoteState

    properties: Properties

    connect: () => Promise<void>

    disconnect: () => void

    profileManifest: ProfileManifest | undefined

    setProfileManifest: (profileManifest: ProfileManifest) => Promise<void>

    profile: Profile | undefined
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

    function setProperties(properties: Properties) {
        set((current) =>
            produce(current, (next) => {
                Object.assign(next.properties, properties)
            })
        )
    }

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

                if (isCharMessage(data)) {
                    Object.entries(data.payload).forEach(([uuid, payload]) => {
                        const buf = Buffer.from(payload, 'base64')

                        switch (uuid) {
                            case CharAddr.StateInfo:
                                return void setProperties({
                                    [Prop.MajorState]: buf.readUint8(0),
                                    [Prop.MinorState]: buf.readUint8(1),
                                })
                            case CharAddr.WaterLevels:
                                return void setProperties({
                                    [Prop.WaterLevel]: buf.readUint16BE() / 0x100 / 50, // 0-1 (50mm tank)
                                })
                            case CharAddr.Temperatures:
                                return void setProperties({
                                    [Prop.WaterHeater]: buf.readUint16BE(0) / 0x100, // 1°C every 256
                                    [Prop.SteamHeater]: buf.readUint16BE(2) / 0x100,
                                    [Prop.GroupHeater]: buf.readUint16BE(4) / 0x100,
                                    [Prop.ColdWater]: buf.readUint16BE(6) / 0x100,
                                    [Prop.TargetWaterHeater]: buf.readUint16BE(8) / 0x100,
                                    [Prop.TargetSteamHeater]: buf.readUint16BE(10) / 0x100,
                                    [Prop.TargetGroupHeater]: buf.readUint16BE(12) / 0x100,
                                    [Prop.TargetColdWater]: buf.readUint16BE(14) / 0x100,
                                })
                            case CharAddr.ShotSample:
                                return void setProperties({
                                    [Prop.ShotSampleTime]: 0, // buf.readUint16BE(0),
                                    [Prop.ShotGroupPressure]: buf.readUInt16BE(2) / 0x1000,
                                    [Prop.ShotGroupFlow]: buf.readUint16BE(4) / 0x1000,
                                    [Prop.ShotMixTemp]: buf.readUint16BE(6) / 0x100,
                                    [Prop.ShotHeadTemp]: (buf.readUint32BE(8) >> 8) / 0x10000,
                                    [Prop.ShotSetMixTemp]: buf.readUint16BE(11) / 0x100,
                                    [Prop.ShotSetHeadTemp]: buf.readUint16BE(13) / 0x100,
                                    [Prop.ShotSetGroupPressure]: buf.readUint8(15) / 0x10,
                                    [Prop.ShotSetGroupFlow]: buf.readUint8(16) / 0x10,
                                    [Prop.ShotFrameNumber]: buf.readUint8(17),
                                    [Prop.ShotSteamTemp]: buf.readUint8(18),
                                })
                            case CharAddr.ShotSettings:
                                return void setProperties({
                                    [Prop.SteamSettings]: buf.readUint8(0),
                                    [Prop.TargetSteamTemp]: buf.readUint8(1),
                                    [Prop.TargetSteamLength]: buf.readUint8(2),
                                    [Prop.TargetHotWaterTemp]: buf.readUint8(3),
                                    [Prop.TargetHotWaterVol]: buf.readUint8(4),
                                    [Prop.TargetHotWaterLength]: buf.readUint8(5),
                                    [Prop.TargetEspressoVol]: buf.readUint8(6),
                                    [Prop.TargetGroupTemp]: buf.readUint16BE(7) / 0x10,
                                })
                            case CharAddr.HeaderWrite:
                                return void console.log('HeaderWrite', decodeShotHeader(buf))
                            case CharAddr.FrameWrite:
                                return void console.log('FrameWrite', decodeShotFrame(buf))
                        }
                    })

                    continue
                }
            }

            ctrl = undefined
        },

        disconnect() {
            ctrl?.discard()

            ctrl = undefined
        },

        profileManifest: undefined,

        async setProfileManifest(profileManifest) {
            const { data } = await axios.get(`/profiles/${profileManifest.id}.toml`)

            const profile = toml.parse(data)

            if (!isProfile(profile)) {
                throw new Error('Invalid profile')
            }

            set((current) =>
                produce(current, (next) => {
                    next.profileManifest = profileManifest

                    next.profile = profile
                })
            )
        },

        profile: undefined,
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
