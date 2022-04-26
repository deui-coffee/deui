import React from 'react'
import tw from 'twin.macro'

type Props = {
  capacity?: number
  className?: string
  unit?: string
  value?: number
}

export default function WaterLevel({
  value = 0,
  capacity = 1500,
  unit = 'ml',
}: Props) {
  const clampedValue = Math.max(0, Math.min(capacity, value))

  return (
    <div
      css={[
        tw`
          h-full
          relative
          w-full
        `,
      ]}
    >
      <div
        css={[
          tw`
            absolute
            bg-blue
            h-full
            left-0
            top-0
          `,
        ]}
        style={{
          width: `${100 * (clampedValue / capacity)}%`,
        }}
      />
      <div
        css={[
          tw`
            -translate-x-1/2
            -translate-y-1/2
            absolute
            font-bold
            font-medium
            left-1/2
            text-t1
            top-1/2
          `,
        ]}
      >
        <span>{clampedValue}</span>
        <span
          css={[
            tw`
              font-normal
              ml-1
              text-light-grey
            `,
          ]}
        >
          {unit}
        </span>
      </div>
    </div>
  )
}
