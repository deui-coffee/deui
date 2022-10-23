import useBackendClient from '$/hooks/useBackendClient'
import { CafeHubEvent, CharAddr, GATTNotifyUpdate } from 'cafehub-client/types'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { MetricAction } from '$/features/metric'
import { MetricId } from '$/features/metric/types'
import { useMetricValue } from '$/features/metric/hooks'

export default function useCharChangeEffect() {
    const client = useBackendClient()

    const dispatch = useDispatch()

    useEffect(() => {
        function onCharChange(msg: GATTNotifyUpdate) {
            switch (msg.results.Char) {
                case CharAddr.WaterLevels:
                    dispatch(
                        MetricAction.set({
                            metricId: MetricId.WaterLevel,
                            value: msg.results.Data,
                        })
                    )

                    return
                case CharAddr.Temperatures:
                    dispatch(
                        MetricAction.set({
                            metricId: MetricId.MetalTemp,
                            value: msg.results.Data,
                        })
                    )

                    return
                default:
                    console.log('Unknown char', msg.results.Char, msg.results.Data)
            }
        }

        client.on(CafeHubEvent.CharChange, onCharChange)

        return () => {
            client.off(CafeHubEvent.CharChange, onCharChange)
        }
    }, [client, dispatch])

    console.log('Water level', useMetricValue(MetricId.WaterLevel))

    console.log('Metal temp', useMetricValue(MetricId.MetalTemp))
}
