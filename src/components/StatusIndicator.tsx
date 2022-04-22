import React from 'react'
import tw from 'twin.macro'

export enum Status {
  None = 'none',
  Idle = 'idle',
  Busy = 'busy',
  On = 'on',
  Off = 'off',
}

type Props = {
  value?: Status
  className?: string
}

export default function StatusIndicator({
  className,
  value = Status.Idle,
}: Props) {
  return (
    <div className={className}>
      <div
        css={[
          tw`
            h-2
            rounded-full
            transition-colors
            duration-500
            w-2
          `,
          value === Status.Idle && tw`bg-lighter-grey dark:bg-dark-grey`,
          value === Status.Off && tw`bg-red`,
          value === Status.On && tw`bg-green`,
          value === Status.Busy &&
            tw`animate-busy-status transition-none text-lighter-grey dark:text-dark-grey`,
          value === Status.None && tw`invisible`,
        ]}
      />
    </div>
  )
}
