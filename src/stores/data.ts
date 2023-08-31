import { Status } from '$/components/StatusIndicator'
import {
    BluetoothState,
    CharAddr,
    MajorState,
    MinorState,
    ShotSettings,
    isCharMessage,
    profiles,
} from '$/types'
import {
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
import { produce } from 'immer'
import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { Buffer } from 'buffer'
import { decodeShotFrame, decodeShotHeader } from '$/utils/shot'
import { getLastKnownProfile, getProfile, storeProfileId } from '$/utils/profile'
import { exec, uploadProfile } from '$/utils/comms'
import getDefaultRemoteState from '$/utils/getDefaultRemoteState'
import stopwatch from '$/utils/stopwatch'
import { floor } from '$/utils'
import avg from '$/utils/avg'

interface DataStore {
    wsState: WebSocketState

    remoteState: RemoteState

    properties: Properties

    connect: () => Promise<void>

    disconnect: () => void

    profile: Profile | undefined

    setProfileId: (profileId: string, options?: { upload?: boolean }) => Promise<void>
}

function getDefaultProperties(): Properties {
    return {
        [Prop.WaterCapacity]: 1500,
    }
}

export const useDataStore = create<DataStore>((set, get) => {
    let ctrl: WsController | undefined

    function setProperties(properties: Properties) {
        set((current) =>
            produce(current, (next) => {
                Object.assign(next.properties, properties)
            })
        )
    }

    const timer = stopwatch()

    let lastState: [MajorState, MinorState] | undefined

    function setMachineStateProperties(majorState: MajorState, minorState: MinorState) {
        const [lastMajorState, lastMinorState] = lastState || []

        if (lastMajorState !== majorState || lastMinorState !== minorState) {
            timer.stop()

            let timerProp: Prop | undefined

            if (majorState === MajorState.Espresso && minorState === MinorState.Pour) {
                timerProp = Prop.EspressoTime
            } else {
                /**
                 * We have to be more precise!
                 */

                timerProp = {
                    [MajorState.Steam]: Prop.SteamTime,
                    [MajorState.HotWater]: Prop.WaterTime,
                    [MajorState.HotWaterRinse]: Prop.FlushTime,
                }[majorState as number]
            }

            if (typeof timerProp !== 'undefined') {
                timer.start({
                    onTick(t) {
                        setProperties({ [timerProp as Prop]: t })
                    },
                })
            }
        }

        setProperties({
            [Prop.MajorState]: majorState,
            [Prop.MinorState]: minorState,
        })
    }

    function getCurrentShotSettings(): ShotSettings {
        const {
            [Prop.SteamSettings]: SteamSettings = 0,
            [Prop.TargetSteamTemp]: TargetSteamTemp = 140,
            [Prop.TargetSteamLength]: TargetSteamLength = 90,
            [Prop.TargetHotWaterTemp]: TargetHotWaterTemp = 85,
            [Prop.TargetHotWaterVol]: TargetHotWaterVol = 120,
            [Prop.TargetHotWaterLength]: TargetHotWaterLength = 45,
            [Prop.TargetEspressoVol]: TargetEspressoVol = 36,
            [Prop.TargetGroupTemp]: TargetGroupTemp = 98,
        } = get().properties

        return {
            SteamSettings,
            TargetSteamTemp,
            TargetSteamLength,
            TargetHotWaterTemp,
            TargetHotWaterVol,
            TargetHotWaterLength,
            TargetEspressoVol,
            TargetGroupTemp,
        }
    }

    async function uploadCurrentProfile() {
        const {
            remoteState: {
                device,
                deviceReady,
                profile: { id: remoteProfileId, ready },
            },
            profile,
        } = get()

        if (!device || !deviceReady) {
            /**
             * Upload would be rejected by the backend because DE1 isn't
             * ready. Do nothing.
             */
            return
        }

        if (!ready) {
            /**
             * We're in the middle of an upload already. Do nothing.
             */
            return
        }

        if (!profile) {
            /**
             * No profile to upload.
             */
            return
        }

        if (remoteProfileId === profile.id) {
            /**
             * Current profile is already the one available to other clients.
             */
            return
        }

        try {
            const shotSettings = await uploadProfile(profile, getCurrentShotSettings())

            setProperties({
                [Prop.SteamSettings]: shotSettings.SteamSettings,
                [Prop.TargetSteamTemp]: shotSettings.TargetSteamTemp,
                [Prop.TargetSteamLength]: shotSettings.TargetSteamLength,
                [Prop.TargetHotWaterTemp]: shotSettings.TargetHotWaterTemp,
                [Prop.TargetHotWaterVol]: shotSettings.TargetHotWaterVol,
                [Prop.TargetHotWaterLength]: shotSettings.TargetHotWaterLength,
                [Prop.TargetEspressoVol]: shotSettings.TargetEspressoVol,
                [Prop.TargetGroupTemp]: shotSettings.TargetGroupTemp,
            })
        } catch (e) {
            console.warn('Failed to upload current profile', e)
        }
    }

    async function setProfileId(profileId: string, { upload = false }: { upload?: boolean } = {}) {
        const profile = await getProfile(profileId)

        set((current) =>
            produce(current, (next) => {
                next.profile = profile
            })
        )

        storeProfileId(profileId)

        if (upload) {
            await uploadCurrentProfile()
        }
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

                    continue
                }

                if (chunk.type === ChunkType.WebSocketError) {
                    console.warn('WebSocker errored', chunk.payload)

                    continue
                }

                const { payload: data } = chunk

                if (isStateMessage(data)) {
                    const remoteState = data.payload

                    set({ remoteState })

                    setTimeout(async () => {
                        if (remoteState.bluetoothState !== BluetoothState.PoweredOn) {
                            return
                        }

                        if (remoteState.scanning || remoteState.connecting || remoteState.device) {
                            return
                        }

                        try {
                            await exec('scan')
                        } catch (e) {
                            console.warn('Scan failed', e)
                        }
                    })

                    const { id: remoteProfileId } = remoteState.profile

                    const newProfileId = remoteProfileId || (await getLastKnownProfile())?.id

                    try {
                        if (newProfileId) {
                            await setProfileId(newProfileId, { upload: !remoteProfileId })
                        }
                    } catch (e) {
                        console.warn('Failed to apply remote profile id', newProfileId)
                    }

                    continue
                }

                if (isCharMessage(data)) {
                    Object.entries(data.payload).forEach(([uuid, payload]) => {
                        const buf = Buffer.from(payload, 'base64')

                        switch (uuid) {
                            case CharAddr.StateInfo:
                                return void setMachineStateProperties(
                                    buf.readUint8(0),
                                    buf.readUint8(1)
                                )
                            case CharAddr.WaterLevels:
                                return void setProperties({
                                    [Prop.WaterLevel]: floor(avg(buf.readUint16BE() / 0x100 / 50)), // 0.00-1.00 (50mm tank)
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
                                    [Prop.ShotSampleTime]: buf.readUint16BE(0),
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
                                    [Prop.TargetGroupTemp]: buf.readUint16BE(7) / 0x100,
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

        profile: undefined,

        setProfileId,
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

    if (remoteState.deviceReady) {
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

    if (remoteState.discoveringCharacteristics) {
        return 'Setting up…'
    }

    if (remoteState.bluetoothState === BluetoothState.PoweredOff) {
        return 'Bluetooth is off'
    }

    if (remoteState.bluetoothState !== BluetoothState.PoweredOn) {
        return 'Bluetooth is unavailable'
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

export function useCurrentProfileLabel() {
    const profileId = useDataStore().profile?.id

    const manifest = useMemo(() => profiles.find(({ id }) => profileId === id), [profileId])

    return manifest?.name
}
