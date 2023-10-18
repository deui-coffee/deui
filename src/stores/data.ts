import { Status } from '$/components/StatusIndicator'
import {
    BluetoothState,
    CharAddr,
    ConnectionPhase,
    MachineMode,
    MajorState,
    MinorState,
    ShotSettings,
    isCharMessage,
    profiles,
} from '$/types'
import {
    ChunkType,
    Profile,
    Prop,
    Properties,
    RemoteState,
    WebSocketState,
    isStateMessage,
} from '$/types'
import wsStream, { WsController } from '$/utils/wsStream'
import { current, produce } from 'immer'
import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { create } from 'zustand'
import { Buffer } from 'buffer'
import { decodeShotFrame, decodeShotHeader } from '$/utils/shot'
import { getLastKnownProfile, getProfile, storeProfileId } from '$/utils/profile'
import { exec, uploadProfile } from '$/utils/comms'
import getDefaultRemoteState from '$/utils/getDefaultRemoteState'
import stopwatch from '$/utils/stopwatch'
import avg from '$/utils/avg'
import { useUiStore } from './ui'
import { sleep } from '$/shared/utils'

interface DataStore {
    wsState: WebSocketState

    remoteState: RemoteState

    properties: Properties

    connect: (options?: { onDeviceReady?: () => void }) => Promise<void>

    disconnect: () => void

    profile: Profile | undefined

    setProfileId: (profileId: string, options?: { upload?: boolean }) => Promise<void>
}

function getDefaultProperties(): Properties {
    return {
        [Prop.WaterCapacity]: 1500,
    }
}

type Stopwatch = ReturnType<typeof stopwatch>

type TimedProp = Prop.EspressoTime | Prop.SteamTime | Prop.WaterTime | Prop.FlushTime

const majorToTimedPropMap: Partial<Record<MajorState, TimedProp>> = {
    [MajorState.Espresso]: Prop.EspressoTime,
    [MajorState.Steam]: Prop.SteamTime,
    [MajorState.HotWater]: Prop.WaterTime,
    [MajorState.HotWaterRinse]: Prop.FlushTime,
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

    function setRemoteState(
        remoteState: RemoteState,
        { onDeviceReady }: { onDeviceReady?: () => void } = {}
    ) {
        /**
         * Scan triggering.
         */
        void (async () => {
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
        })()

        /**
         * Profile setting.
         */
        void (async () => {
            const { id: remoteProfileId } = remoteState.profile

            const newProfileId = remoteProfileId || (await getLastKnownProfile())?.id

            try {
                if (newProfileId) {
                    await setProfileId(newProfileId, { upload: !remoteProfileId })
                }
            } catch (e) {
                console.warn('Failed to apply remote profile id', newProfileId)
            }
        })()

        /**
         * Readyness reporting.
         */
        void (() => {
            const { deviceReady: previousDeviceReady } = get().remoteState

            if (!previousDeviceReady && remoteState.deviceReady) {
                onDeviceReady?.()
            }
        })()

        set((store) =>
            produce(store, (draft) => {
                draft.remoteState = remoteState
            })
        )
    }

    const timers: Record<TimedProp, Stopwatch | undefined> = {
        [Prop.EspressoTime]: undefined,
        [Prop.SteamTime]: undefined,
        [Prop.WaterTime]: undefined,
        [Prop.FlushTime]: undefined,
    }

    let recentTimer: Stopwatch | undefined

    function engageTimerForState(majorState: MajorState, minorState: MinorState) {
        const pourTimedProp =
            minorState === MinorState.Pour ? majorToTimedPropMap[majorState] : void 0

        const npnflushTimedProp =
            minorState !== MinorState.Flush ? majorToTimedPropMap[majorState] : void 0

        if (!pourTimedProp) {
            recentTimer?.stop()

            recentTimer = undefined

            if (npnflushTimedProp) {
                setProperties({ [npnflushTimedProp]: 0 })
            }

            return
        }

        const timer = timers[pourTimedProp] || (timers[pourTimedProp] = stopwatch())

        if (timer === recentTimer) {
            /**
             * We're received a second hit for the same timer. Skip.
             */
            return
        }

        /**
         * Timers are different at this point, we know. Stop the
         * previous one and start the current one.
         */
        recentTimer?.stop()

        /**
         * And remeber the current one for the next round of states.
         */
        recentTimer = timer

        /**
         * Start the current timer and make it update associated
         * timed prop.
         */
        timer.start({
            onTick(t) {
                setProperties({ [pourTimedProp]: t })
            },
        })
    }

    function setMachineStateProperties(majorState: MajorState, minorState: MinorState) {
        engageTimerForState(majorState, minorState)

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

        async connect({ onDeviceReady } = {}) {
            ctrl?.discard()

            set({ wsState: WebSocketState.Opening })

            /**
             * Let's give the opening state at least 1s of TTL so that in case of a network
             * glitch we don't flash with a barely noticable "Opening…" in the UI.
             */
            await sleep()

            try {
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
                        break
                    }

                    if (chunk.type === ChunkType.WebSocketOpen) {
                        set({ wsState: WebSocketState.Open })

                        continue
                    }

                    if (chunk.type === ChunkType.WebSocketError) {
                        throw chunk.payload
                    }

                    const { payload: data } = chunk

                    if (isStateMessage(data)) {
                        const remoteState = data.payload

                        setRemoteState(remoteState, {
                            onDeviceReady,
                        })

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
                                        [Prop.WaterLevel]: avg(buf.readUint16BE() / 0x100 / 50, 7), // 0.00-1.00 (50mm tank)
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
            } finally {
                set({
                    wsState: WebSocketState.Closed,
                })

                setProperties(getDefaultProperties())

                setRemoteState(getDefaultRemoteState())

                ctrl = undefined
            }
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

function clearReffedTimeoutId(ref: MutableRefObject<number | undefined>) {
    if (ref.current) {
        clearTimeout(ref.current)

        ref.current = undefined
    }
}

export function useAutoConnectEffect() {
    const { connect, disconnect } = useDataStore()

    const { machineMode, setMachineMode } = useUiStore()

    const machineModeRef = useRef(machineMode)

    if (machineModeRef.current !== machineMode) {
        machineModeRef.current = machineMode
    }

    const timeoutIdRef = useRef<number | undefined>(undefined)

    useEffect(() => void clearReffedTimeoutId(timeoutIdRef), [machineMode])

    useEffect(() => {
        let mounted = true

        void (async () => {
            let attempts = 0

            let reachedReadyness = false

            while (true) {
                if (!mounted) {
                    return
                }

                try {
                    await connect({
                        onDeviceReady() {
                            reachedReadyness = true
                            /**
                             * Clear the previous timeouts to ensure integrity.
                             */
                            clearReffedTimeoutId(timeoutIdRef)

                            /**
                             * Schedule a switch from `Server` to `Espresso` in 2s.
                             */
                            timeoutIdRef.current = window.setTimeout(() => {
                                if (mounted && machineModeRef.current === MachineMode.Server) {
                                    setMachineMode(MachineMode.Espresso)
                                }
                            }, 2000)
                        },
                    })

                    attempts = 0
                } catch (e) {
                    console.warn('Connect failed', e)

                    /**
                     * 40 x 250ms = 10s, max.
                     */
                    attempts = Math.min(40, attempts + 1)
                } finally {
                    if (reachedReadyness) {
                        /**
                         * At this point we're not connected and definitely
                         * not ready. Take the user to the Server state.
                         *
                         * It's important to note that we only do it after
                         * a successful connection to the machine (common sense).
                         */
                        setMachineMode(MachineMode.Server)
                    }

                    reachedReadyness = false

                    /**
                     * Whatever happened, clean up the timeout so we don't
                     * switch to `Espresso` for no reason.
                     */
                    clearReffedTimeoutId(timeoutIdRef)
                }

                /**
                 * Wait a while before trying to reconnect.
                 */
                await sleep(attempts * 250)
            }
        })()

        return () => {
            mounted = false

            disconnect()
        }
    }, [disconnect, connect, setMachineMode])
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
    switch (useConnectionPhase()) {
        case ConnectionPhase.BluetoothOff:
            return 'Bluetooth is off'
        case ConnectionPhase.ConnectingAdapters:
            return 'Connecting to DE1…'
        case ConnectionPhase.NoBluetooth:
            return 'Bluetooth is unavailable'
        case ConnectionPhase.Opening:
            return 'Opening…'
        case ConnectionPhase.Scanning:
            return 'Looking for DE1…'
        case ConnectionPhase.SettingUp:
            return 'Setting up…'
        case ConnectionPhase.WaitingToReconnect:
            return 'Reconnecting shortly…'
        case ConnectionPhase.Irrelevant:
        default:
    }
}

export function useConnectionPhase() {
    const { wsState, remoteState } = useDataStore()

    const status = useStatus()

    if (wsState === WebSocketState.Closed) {
        return ConnectionPhase.WaitingToReconnect
    }

    if (status !== Status.Busy) {
        return ConnectionPhase.Irrelevant
    }

    if (wsState === WebSocketState.Opening) {
        return ConnectionPhase.Opening
    }

    if (remoteState.scanning) {
        return ConnectionPhase.Scanning
    }

    if (remoteState.connecting) {
        return ConnectionPhase.ConnectingAdapters
    }

    if (remoteState.discoveringCharacteristics) {
        return ConnectionPhase.SettingUp
    }

    if (remoteState.bluetoothState === BluetoothState.PoweredOff) {
        return ConnectionPhase.BluetoothOff
    }

    if (remoteState.bluetoothState !== BluetoothState.PoweredOn) {
        return ConnectionPhase.NoBluetooth
    }
}

export function useCurrentProfileLabel() {
    const profileId = useDataStore().profile?.id

    const manifest = useMemo(() => profiles.find(({ id }) => profileId === id), [profileId])

    return manifest?.name
}
