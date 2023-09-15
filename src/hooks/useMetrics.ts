import { Metrics } from '$/components/Metric'
import { useUiStore } from '$/stores/ui'
import { MachineMode } from '$/types'
import { useEffect, useState } from 'react'

export default function useMetrics() {
    const { machineMode } = useUiStore()

    const [measurableMachineMode, setMeasurableMachineMode] = useState(
        machineMode === MachineMode.Server ? MachineMode.Espresso : machineMode
    )

    useEffect(() => {
        if (machineMode === MachineMode.Server) {
            return
        }

        setMeasurableMachineMode(machineMode)
    }, [machineMode])

    return Metrics[measurableMachineMode]
}
