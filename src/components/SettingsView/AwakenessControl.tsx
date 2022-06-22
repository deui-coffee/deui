import React from 'react'
import Control, { ControlProps } from '$/components/Control'
import { useDispatch } from 'react-redux'
import { MachineAction } from '../../features/machine'
import { useAwake } from '../../features/machine/hooks'
import { Awake } from '../../features/machine/types'
import { Status } from '../StatusIndicator'
import Toggle from '../Toggle'

const labels = ['Sleep']

export default function AwakenessControl({ label = 'Power', ...props }: ControlProps) {
    const isOn = useAwake() === Awake.Yes

    const dispatch = useDispatch()

    return (
        <Control {...props} label={label}>
            <Toggle
                status={(a: boolean) => {
                    if (a !== isOn) {
                        return Status.Idle
                    }

                    if (!a) {
                        return Status.Off
                    }

                    return Status.On
                }}
                onChange={(state) =>
                    void dispatch(MachineAction.setAwake(state ? Awake.Yes : Awake.No))
                }
                labels={labels}
                value={isOn}
                reverse
            />
        </Control>
    )
}
