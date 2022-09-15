import React from 'react'
import { Status } from './StatusIndicator'
import Toggle from './Toggle'

const labels = ['Sleep']

export default function PowerToggle() {
    return <Toggle status={Status.Off} labels={labels} value={false} reverse />
}
