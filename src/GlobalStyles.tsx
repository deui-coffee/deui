import { css, Global } from '@emotion/react'
import React from 'react'
import tw, { GlobalStyles as BaseStyles } from 'twin.macro'

const customStyles = css`
  body {
    ${tw`antialiased font-lab-grotesque`};
  }

  html.dark {
    ${tw`bg-off-black`};
  }

  html.light {
    ${tw`bg-offish-white`};
  }
`

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
)

export default GlobalStyles
