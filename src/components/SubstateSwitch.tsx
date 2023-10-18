import React from 'react'
import TextSwitch from '$/components/TextSwitch'
import { ConnectionPhase, MachineMode, MinorState } from '$/types'
import { useConnectionPhase, useMinorState } from '$/stores/data'
import { useUiStore } from '$/stores/ui'
import { useIsMachineModeActive } from '$/hooks'

export default function SubstateSwitch() {
    const substate = useMinorState()

    const { machineMode } = useUiStore()

    const connPhase = useConnectionPhase()

    const activeMode = useIsMachineModeActive()

    const value = machineMode === MachineMode.Server ? connPhase : activeMode ? substate : void 0

    return (
        <TextSwitch
            items={[
                [MinorState.Steaming, 'Steaming'],
                [MinorState.HeatWaterTank, 'Warming up'],
                [MinorState.HeatWaterHeater, 'Warming up'],
                [MinorState.StabilizeMixTemp, 'Stabilizing'],
                [MinorState.PreInfuse, 'Preinfuse'],
                [MinorState.Pour, 'Pouring'],
                [MinorState.Flush, 'Flushing'],
                [ConnectionPhase.WaitingToReconnect, 'Waiting'],
                [ConnectionPhase.Opening, 'Opening'],
                [ConnectionPhase.Scanning, 'Scanning'],
                [ConnectionPhase.ConnectingAdapters, 'Connecting'],
                [ConnectionPhase.SettingUp, 'Setting up'],
                [ConnectionPhase.BluetoothOff, 'Bluetooth off'],
                [ConnectionPhase.NoBluetooth, 'No bluetooth'],
            ]}
            value={value}
        />
    )
}
