import useCafeHubClient from '$/hooks/useCafeHubClient'
import { useEffect } from 'react'
import { CafeHubClientEvent, Device } from 'cafehub-client/types'
import { useDispatch } from 'react-redux'
import { CafeHubAction } from '$/features/cafehub'

export default function useDeviceDiscoveryEffect() {
    const client = useCafeHubClient()

    const dispatch = useDispatch()

    useEffect(() => {
        function onDeviceFound(device: Device) {
            if (device.Name === 'DE1') {
                dispatch(CafeHubAction.storeDevice(device))
            }
        }

        client.on(CafeHubClientEvent.DeviceFound, onDeviceFound)

        return () => {
            client.off(CafeHubClientEvent.DeviceFound, onDeviceFound)
        }
    }, [client])
}
