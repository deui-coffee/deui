import React, { useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import { useTheme, Theme } from './hooks/useTheme'
import Viewport from './components/Viewport'
import Page from './components/Page'
import { View } from './types'
import GlobalStyles from './GlobalStyles'
import WaterLevel from './components/WaterLevel'
import Control from './components/Control'
import Toggle from './components/Toggle2'
import { Status } from './components/StatusIndicator'

enum Power {
  On = 'on',
  Off = 'off',
}

const App = () => {
  const [theme, setTheme] = useTheme()

  const [power, setPower] = useState<Power>(Power.Off)

  const { current: capacity } = useRef<number>(1000)

  return (
    <>
      <Helmet>
        <html className={theme} />
      </Helmet>
      <GlobalStyles />
      <Viewport>
        <Page view={View.Settings}>
          <Control
            label={
              <>
                <span>Water tank</span>
                <span>{(capacity / 1000).toFixed(1)}L</span>
              </>
            }
          >
            <WaterLevel capacity={capacity} unit="ml" value={672} />
          </Control>
          <Control label="Theme">
            <Toggle
              onChange={(newTheme) => void setTheme(newTheme as Theme)}
              options={[
                [Theme.Dark as string, 'Dark'],
                [Theme.Light as string, 'Light'],
              ]}
              value={theme}
            />
          </Control>
          <Control label="Power">
            <Toggle
              status={(p: string) => {
                if (p !== power) {
                  return Status.Idle
                }

                return p === Power.On ? Status.Busy : Status.Off
              }}
              onChange={(newPower) => void setPower(newPower as Power)}
              options={[
                [Power.Off as string, 'Off'],
                [Power.On as string, 'On'],
              ]}
              value={power}
            />
          </Control>
        </Page>
        <Page view={View.Metrics} />
        <Page view={View.Profiles} />
      </Viewport>
    </>
  )
}

export default App
