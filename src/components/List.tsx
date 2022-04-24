import React, { Children, ReactNode } from 'react'
import tw from 'twin.macro'

type Props = {
  children?: ReactNode
}

export default function List({ children }: Props) {
  return (
    <ul
      css={[
        tw`
        `,
      ]}
    >
      {Children.map(children, (child) => (
        <li>{child}</li>
      ))}
    </ul>
  )
}
