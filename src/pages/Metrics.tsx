import React from 'react'
import { Link } from 'react-router-dom'
import 'twin.macro'
import BlockLabel from '../components/BlockLabel'
import ChevronIcon from '../icons/ChevronIcon'

const data = [
  {
    name: 'Metal Temp',
    measurement: '56',
    unit: '°C',
  },
  {
    name: 'Pressure',
    measurement: '0.0',
    unit: 'bar',
  },
  {
    name: 'Flow Rate',
    measurement: '0.0',
    unit: 'ml/s',
  },
  {
    name: 'Shot Time',
    measurement: '0.0',
    unit: 's',
  },
  {
    name: 'Weight',
    measurement: '0.0',
    unit: 'g',
  },
]

const Metrics = () => (
  <>
    <header tw="pb-8">
      <h1 tw="mb-2 text-large">Espresso</h1>
      <p tw="text-normal dark:text-medium-grey light:text-light-grey">
        Warming up
      </p>
    </header>

    <Divider />

    <Link to="#" tw="flex items-center justify-between py-8 text-medium">
      <span>Best overall pressure</span>
      <span tw="dark:text-medium-grey light:text-light-grey">
        <ChevronIcon />
      </span>
    </Link>

    <Divider />

    <div tw="flex flex-col gap-8 py-8">
      {data.map((measure) => (
        <Measurement
          key={measure.name}
          name={measure.name}
          measurement={measure.measurement}
          unit={measure.unit}
        />
      ))}
    </div>

    <Divider />
  </>
)

const Divider = () => (
  <hr tw="w-full border-t dark:border-heavy-grey light:border-offish-white" />
)

interface MeasurementProps {
  name: string
  measurement: string
  unit: string
}

const Measurement: React.FC<MeasurementProps> = ({
  name,
  measurement,
  unit,
}) => (
  <div>
    <BlockLabel>{name}</BlockLabel>
    <p tw="text-3xl">
      <span tw="pr-2">{measurement}</span>
      <span tw="dark:text-medium-grey light:text-light-grey">{unit}</span>
    </p>
  </div>
)

export default Metrics
