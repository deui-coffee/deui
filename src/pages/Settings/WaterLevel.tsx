import { css } from '@emotion/react'
import React, { useState } from 'react'
import tw from 'twin.macro'
import BlockLabel from '../../components/BlockLabel'
import { blockStyles } from './Settings'

interface WaterLevelProps {
  volume: number
}

export const WaterLevel: React.FC<WaterLevelProps> = () => {
  const [volume, setVolume] = useState(0)

  return (
    <article>
      <BlockLabel>
        <span>Water tank</span>
        <span>1.5L max</span>
      </BlockLabel>
      <div
        onClick={() => setVolume(Math.floor(Math.random() * 150) * 10)}
        css={[
          blockStyles,
          tw`before:(content absolute transition-all duration-500 left-0 h-full dark:bg-dark-blue light:bg-blue)`,
          css`
            &:before {
              width: ${volume / 15}%;
            }
          `,
        ]}
      >
        <p tw="z-10 text-normal">
          <span tw="dark:text-lighter-grey light:text-darker-grey">
            {volume}
          </span>
          <span tw="dark:text-medium-grey light:text-light-grey"> ml</span>
        </p>
      </div>
    </article>
  )
}
