import { css, Global } from '@emotion/react'
import React from 'react'
import tw, { GlobalStyles as BaseStyles } from 'twin.macro'

const customStyles = css`
  html {
    ${tw`bg-offish-white`};
  }

  html.dark {
    ${tw`bg-off-black`};
  }

  body {
    ${tw`antialiased font-lab-grotesque`};
  }
`

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
)

export default GlobalStyles
