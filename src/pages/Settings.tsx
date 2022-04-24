import React, { useRef, useState } from 'react'
import Control from '../components/Control'
import WaterLevel from '../components/WaterLevel'
import Select from '../components/Select'
import Toggle from '../components/Toggle'
import { useTheme, Theme } from '../hooks/useTheme'
import { Status } from '../components/StatusIndicator'

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

export default function Settings() {
  const [theme, setTheme] = useTheme()

  const [power, setPower] = useState<Power>(Power.Off)

  const [scale, setScale] = useState<string | undefined>()

  const [visualizer, setVisualizer] = useState<string | undefined>('viewShot')

  const { current: capacity } = useRef<number>(1000)

  return (
    <>
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
    </>
  )
}
