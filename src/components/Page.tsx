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
    bg-off-white
    box-border
    dark:(bg-dark-grey text-lighter-grey)
    flex-zz-full
    h-screen
    max-h-[844px]
    max-w-[390px]
    p-14
    text-darker-grey
    w-screen
`

export default Page
