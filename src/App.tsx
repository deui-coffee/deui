import React, { useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw, { css } from 'twin.macro'
import { useTheme, Theme } from './hooks/useTheme'
import Viewport from './components/Viewport'
import Page from './components/Page'
import { View } from './types'
import GlobalStyles from './GlobalStyles'
import WaterLevel from './components/WaterLevel'
import Control from './components/Control'
import Toggle from './components/Toggle2'
import Select from './components/Select'
import Metric from './components/Metric'
import { Status } from './components/StatusIndicator'

enum Power {
  On = 'on',
  Off = 'off',
}

const Scales: [string, string][] = [
  ['acaia', 'Acaia Lunar'],
  ['wh', 'WH-1000XM4'],
  ['de-sc', 'Decent scale'],
  ['m.a.p', 'Matt’s Airpods Pro'],
]

const VisualizerOptions: [string, string][] = [['viewShot', 'View shot']]

const App = () => {
  const [theme, setTheme] = useTheme()

  const [power, setPower] = useState<Power>(Power.Off)

  const [scale, setScale] = useState<string | undefined>()

  const [visualizer, setVisualizer] = useState<string | undefined>('viewShot')

  const { current: capacity } = useRef<number>(1000)

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
            <Control label="Scale">
              <Select
                onChange={setScale}
                options={Scales}
                placeholder="Connect"
                status={Status.Busy}
                value={scale}
              />
            </Control>
            <Control label="Visualizer">
              <Select
                onChange={setVisualizer}
                options={VisualizerOptions}
                status={Status.On}
                value={visualizer}
              />
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
          <Page view={View.Metrics}>
            <header>
              <h1
                css={[
                  tw`
                    dark:text-lighter-grey
                    font-medium
                    text-t2
                  `,
                ]}
              >
                Expresso
              </h1>
              <p
                css={[
                  tw`
                    font-medium
                    dark:text-medium-grey
                    text-t0
                    mt-1
                  `,
                ]}
              >
                Warming up
              </p>
            </header>
            <button
              type="button"
              css={[
                css`
                  -webkit-tap-highlight-color: transparent;
                `,
                tw`
                  appearance-none
                  border-b
                  border-heavy-grey
                  border-t
                  flex
                  font-medium
                  h-[88px]
                  items-center
                  justify-between
                  text-left
                  text-t1
                  w-full
                  my-8
                `,
              ]}
            >
              <div>Best overall pressure</div>
              <div>
                <svg
                  width="11"
                  height="19"
                  viewBox="0 0 11 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.006 1.353a1.5 1.5 0 0 1 2.122 0l7.07 7.07a1.5 1.5 0 0 1 0 2.122l-7.066 7.067a1.5 1.5 0 0 1-2.122-2.121l6.007-6.007-6.01-6.01a1.5 1.5 0 0 1 0-2.121z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </button>
            <Metric label="Metal Temp" value={56} unit="°C" />
            <Metric label="Pressure" value={0.0} unit="bar" />
            <Metric label="Flow Rate" value={0.0} unit="ml/s" />
            <Metric label="Shot Time" value={0.0} unit="s" />
            <Metric label="Weight" value={0.0} unit="g" />
          </Page>
          <Page view={View.Profiles} />
        </Viewport>
      </div>
    </>
  )
}

export default App
