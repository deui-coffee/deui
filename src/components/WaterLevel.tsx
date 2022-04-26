import React from 'react'
import tw from 'twin.macro'

type Props = {
  capacity?: number
  className?: string
  unit?: string
  value?: number
}

function UnstyledWaterLevel({
  className,
  value = 0,
  capacity = 1500,
  unit = 'ml',
}: Props) {
  const clampedValue = Math.max(0, Math.min(capacity, value))

  return (
    <div className={className}>
      <WaterLine
        style={{
          width: `${100 * (clampedValue / capacity)}%`,
        }}
      />
      <Value>
        <span>{clampedValue}</span>
        <Unit>{unit}</Unit>
      </Value>
    </div>
  )
}

const Unit = tw.span`
  font-normal
  ml-1
  text-light-grey
`

const Value = tw.div`
  -translate-x-1/2
  -translate-y-1/2
  absolute
  font-bold
  font-medium
  left-1/2
  text-t1
  top-1/2
`

const WaterLine = tw.div`
  absolute
  bg-blue
  h-full
  left-0
  top-0
`

const WaterLevel = tw(UnstyledWaterLevel)`
  h-full
  relative
  w-full
`

export default WaterLevel
