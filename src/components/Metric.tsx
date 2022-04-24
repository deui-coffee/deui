import React from 'react'
import tw from 'twin.macro'
import Label from './Label'

type Props = {
  label: string
  unit: string
  value: number
}

export default function Metric({ value, unit, label }: Props) {
  return (
    <div
      css={[
        tw`
          [& + &]:mt-5
          font-medium
        `,
      ]}
    >
      <Label>{label}</Label>
      <div
        css={[
          tw`
            -mt-1
            text-t2
          `,
        ]}
      >
        <span>{value}</span>
        <span
          css={[
            tw`
              dark:text-medium-grey
              ml-2
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
