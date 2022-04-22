import React, { ReactNode } from 'react'
import tw from 'twin.macro'

type Props = {
  className?: string
  children?: ReactNode
  label?: ReactNode
}

function UnstyledControl({ className, label, children }: Props) {
  return (
    <div className={className}>
      {!!label && <Label>{label}</Label>}
      <Body>{children}</Body>
    </div>
  )
}

const Control = tw(UnstyledControl)`
    [* + &]:mt-4
`

const Label = tw.label`
    dark:text-medium-grey
    flex
    justify-between
    m-0
    text-label
    text-light-grey
    uppercase
`

const Body = tw.div`
    bg-white
    dark:bg-black
    h-[5.5rem]
    overflow-hidden
    relative
    rounded-lg
`

export default Control
