import React, { ReactNode } from 'react'
import tw from 'twin.macro'
import Label from './Label'

type Props = {
  className?: string
  children?: ReactNode
  label?: ReactNode
}

export default function Control({ label, children }: Props) {
  return (
    <div
      css={[
        tw`
          [* + &]:mt-4
        `,
      ]}
    >
      {!!label && <Label>{label}</Label>}
      <div
        css={[
          tw`
            bg-white
            dark:bg-black
            h-[5.5rem]
            overflow-hidden
            relative
            rounded-lg
          `,
        ]}
      >
        {children}
      </div>
    </div>
  )
}
