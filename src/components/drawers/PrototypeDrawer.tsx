import Drawer, { DrawerProps } from '$/components/drawers/Drawer'
import { useDataStore, useIsOn } from '$/stores/data'
import { WebSocketState } from '$/types'
import tw from 'twin.macro'
import Button from '../primitives/Button'
import { exec } from '$/utils/comms'

interface PrototypeDrawerProps extends Pick<DrawerProps, 'onReject'> {}

export default function PrototypeDrawer({ onReject }: PrototypeDrawerProps) {
    const { connect, disconnect, wsState, remoteState } = useDataStore()

    const wsOpen = wsState === WebSocketState.Open

    const isOn = useIsOn()

    return (
        <Drawer onReject={onReject}>
            <div css={tw`text-white`}>
                <Button type="button" disabled={wsOpen} onClick={() => void connect()}>
                    Connect
                </Button>
                <Button type="button" disabled={!wsOpen} onClick={() => void disconnect()}>
                    Disconnect
                </Button>
                <hr />
                <Button
                    type="button"
                    disabled={!wsOpen || !!remoteState?.device}
                    onClick={() => void exec('scan')}
                >
                    Scan
                </Button>
                <br />
                <Button
                    type="button"
                    disabled={!remoteState?.device || isOn}
                    onClick={() => void exec('on')}
                >
                    Go idle
                </Button>
                <Button
                    type="button"
                    disabled={!remoteState?.device || !isOn}
                    onClick={() => void exec('off')}
                >
                    Go sleep
                </Button>
                <hr />
                <div>
                    Bluetooth: {remoteState?.bluetoothState || 'unknown'}
                    <br />
                    Scanning: {remoteState?.scanning ? 'Yes' : 'No'}
                    <br />
                    Connecting: {remoteState?.connecting ? 'Yes' : 'No'}
                    <br />
                    Discovering chars: {remoteState?.discoveringCharacteristics ? 'Yes' : 'No'}
                    <br />
                    Device: {remoteState?.device ? JSON.stringify(remoteState.device) : 'No device'}
                </div>
            </div>
        </Drawer>
    )
}
