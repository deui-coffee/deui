import React, { ReactNode } from 'react'
import tw from 'twin.macro'
import Label from './Label'

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

const Body = tw.div`
  bg-white
  dark:bg-black
  h-[5.5rem]
  overflow-hidden
  relative
  rounded-lg
`

export default Control
