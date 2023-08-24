import { BluetoothState, RemoteState } from '../types'

export default function getDefaultRemoteState(): RemoteState {
    return {
        bluetoothState: BluetoothState.Unknown,
        scanning: false,
        connecting: false,
        discoveringCharacteristics: false,
        device: undefined,
        deviceReady: false,
        profile: {
            id: undefined,
            /**
             * No `id` is *ready* by default because the server isn't doing
             * anything with it.
             */
            ready: true,
        },
    }
}
