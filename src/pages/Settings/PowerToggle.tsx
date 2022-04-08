import React, { useState } from 'react'
import tw from 'twin.macro'
import BlockLabel from '../../components/BlockLabel'
import { ToggleButton, ToggleContainer } from '../../components/Toggle'
import { blockStyles } from './Settings'

export const PowerToggle = () => {
  const [power, setPower] = useState<'on' | 'off'>('off')
  return (
    <article>
      <BlockLabel>Power</BlockLabel>
      <div css={[blockStyles, tw`p-3`]}>
        <ToggleContainer isOn={power === 'on'} showDot>
          <ToggleButton
            label="On"
            selected={power === 'on'}
            onClick={() => setPower('on')}
          />
          <ToggleButton
            label="Sleep"
            selected={power === 'off'}
            onClick={() => setPower('off')}
          />
        </ToggleContainer>
      </div>
    </article>
  )
}
