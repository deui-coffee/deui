import React, { ReactNode } from 'react'
import tw from 'twin.macro'

export type Props = {
  className?: string
  view: string
  children?: ReactNode
}

export default function Page({ view, children = view }: Props) {
  return (
    <div
      css={[
        tw`
          box-border
          p-14
        `,
      ]}
    >
      {children}
    </div>
  )
}
