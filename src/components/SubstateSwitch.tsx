import React from 'react'
import TextSwitch from '$/components/TextSwitch'
import { ConnectionPhase, MachineMode, MajorState, MinorState } from '$/shared/types'
import { useConnectionPhase, useMajorState, useMinorState } from '$/stores/data'
import { useUiStore } from '$/stores/ui'
import { useIsMachineModeActive } from '$/hooks'

enum CustomState {
    Running = 2001,
}

export default function SubstateSwitch() {
    const substate = ((majorState, minorState) => {
        return majorState === MajorState.Steam && minorState === MinorState.Pour
            ? CustomState.Running
            : minorState
    })(useMajorState(), useMinorState())

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
                [CustomState.Running, 'Running'],
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
