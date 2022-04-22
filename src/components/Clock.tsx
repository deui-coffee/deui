import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'

type Time = {
  ampm: 'am' | 'pm'
  hour: string
  minute: string
}

type Props = {
  className?: string
}

function UnstyledClock({ className }: Props) {
  const [time, setTime] = useState<Time>()

  useEffect(() => {
    let mounted = true

    let recentTime: string

    let timeout: number | undefined

    function tick() {
      const newTime = new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })

      if (recentTime === newTime || !mounted) {
        return
      }

      recentTime = newTime

      const [, hour = '', minute = '', ampm = 'am'] =
        newTime.toLowerCase().match(/^(\d+):(\d+) (am|pm)$/i) || []

      setTime({
        ampm: ampm as Time['ampm'],
        hour,
        minute,
      })

      timeout = window.setTimeout(tick, 1000)
    }

    tick()

    return () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }

      mounted = false
    }
  }, [])

  if (typeof time === 'undefined') {
    return (
      <div className={className}>
        {/* Preserve space. */}
        &zwnj;
      </div>
    )
  }

  return (
    <div className={className}>
      {/* @TODO: Make sure digits take equal amount of space, horizontally. #no-jumping */}
      {time.hour}:{time.minute}
      <Ampm>{time.ampm}</Ampm>
    </div>
  )
}

const Ampm = styled.span`
  font-size: 2rem;
  opacity: 0.5;
  text-transform: uppercase;
`

const Clock = styled(UnstyledClock)`
  font-size: 200px;
`

export default Clock
