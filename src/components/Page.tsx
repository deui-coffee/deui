import React, { ReactNode } from 'react'
import tw from 'twin.macro'

export type Props = {
  className?: string
  view: string
  children?: ReactNode
}

function UnstyledPage({ className, view, children = view }: Props) {
  return <div className={className}>{children}</div>
}

const Page = tw(UnstyledPage)`
    dark:(bg-dark-grey text-lighter-grey)
    flex-zz-full
    h-screen
    light:(bg-off-white text-darker-grey)
    max-h-[844px]
    max-w-[390px]
    w-screen
    p-14
    box-border
`

export default Page
