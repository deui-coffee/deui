import React, { useState } from 'react'
import tw from 'twin.macro'
import BlockLabel from '../../components/BlockLabel'
import { blockStyles } from './Settings'

export const ScaleConnect = () => {
  const [scale, setScale] = useState<string | null>()
  const isConnected = !!scale

  return (
    <article>
      <BlockLabel>Scale</BlockLabel>
      <div
        onClick={() => (scale ? setScale(null) : setScale('Skale 2'))}
        css={[
          blockStyles,
          tw`after:(content transition-all duration-300 absolute rounded-full top-2 right-2 h-2 w-2)`,
          isConnected ? tw`after:bg-green` : tw`after:bg-red`,
        ]}
      >
        <p
          css={[
            tw`text-normal`,
            isConnected
              ? tw`dark:text-lighter-grey light:text-darker-grey`
              : tw`dark:text-medium-grey light:text-light-grey`,
          ]}
        >
          {isConnected ? scale : 'Connect'}
        </p>
      </div>
    </article>
  )
}
