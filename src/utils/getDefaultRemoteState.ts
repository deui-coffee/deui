import { BluetoothState, RemoteState } from '../shared/types'

export default function getDefaultRemoteState(): RemoteState {
    return {
        bluetoothState: BluetoothState.Unknown,
        connecting: false,
        device: undefined,
        deviceReady: false,
        discoveringCharacteristics: false,
        profileId: 'default',
        scanning: false,
    }
}
