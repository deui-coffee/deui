import React from 'react'
import tw from 'twin.macro'
import BlockLabel from '../../components/BlockLabel'
import { ToggleButton, ToggleContainer } from '../../components/Toggle'
import { useTheme } from '../../hooks/useTheme'
import { blockStyles } from './Settings'

export const ThemeToggle = () => {
  const [theme, setTheme] = useTheme()

  return (
    <article>
      <BlockLabel>Theme</BlockLabel>
      <div css={[blockStyles, tw`p-3`]}>
        <ToggleContainer isOn={theme === 'dark'}>
          <ToggleButton
            label="Dark"
            selected={theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
          <ToggleButton
            label="Light"
            selected={theme === 'light'}
            onClick={() => setTheme('light')}
          />
        </ToggleContainer>
      </div>
    </article>
  )
}
