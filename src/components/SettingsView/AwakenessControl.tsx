import React from 'react'
import { useDispatch } from 'react-redux'
import { MachineAction } from '../../features/machine'
import { useAwake } from '../../features/machine/hooks'
import { Awake } from '../../features/machine/types'
import Control from '../Control'
import { Status } from '../StatusIndicator'
import Toggle from '../Toggle'

export default function AwakenessControl() {
    const awake = useAwake()

    const dispatch = useDispatch()

    return (
        <Control label="State">
            <Toggle
                status={(a: string) => {
                    if (a !== awake || a !== Awake.Yes) {
                        return Status.Idle
                    }

                    return Status.Busy
                }}
                onChange={(newAwake) => void dispatch(MachineAction.setAwake(newAwake as Awake))}
                options={[
                    [Awake.Yes as string, 'On'],
                    [Awake.No as string, 'Sleep'],
                ]}
                value={awake}
            />
        </Control>
    )
}
