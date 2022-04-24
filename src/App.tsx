import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import Page from './components/Page'
import { View } from './types'
import GlobalStyles from './GlobalStyles'
import Metrics from './pages/Metrics'
import Settings from './pages/Settings'
import { useTheme } from './hooks/useTheme'

const App = () => {
  const [theme] = useTheme()

  return (
    <>
      <Helmet>
        <html className={theme} />
      </Helmet>
      <GlobalStyles />
      <div
        css={[
          tw`
            h-screen
            w-screen
          `,
        ]}
      >
        <Viewport initialView={View.Metrics}>
          <Page view={View.Settings}>
            <Settings />
          </Page>
          <Page view={View.Metrics}>
            <Metrics />
          </Page>
          <Page view={View.Profiles} />
        </Viewport>
      </div>
    </>
  )
}

export default App
