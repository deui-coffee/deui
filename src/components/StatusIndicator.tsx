import React from 'react'
import tw from 'twin.macro'

type Props = {
  active?: boolean
  className?: string
}

function UnstyledStatusIndicator({ className, active }: Props) {
  return (
    <div className={className}>
      <div
        css={[
          tw`
            bg-light-grey
            h-full
            rounded-full
            transition-colors
            w-full
          `,
          active === false && tw`bg-red`,
          active === true && tw`bg-green`,
        ]}
      />
    </div>
  )
}

const StatusIndicator = tw(UnstyledStatusIndicator)`
    box-content
    p-2
    w-2
    h-2
`

export default StatusIndicator
