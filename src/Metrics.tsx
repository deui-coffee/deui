import React from "react";
import { Link } from "react-router-dom";
import "twin.macro";

const data = [
  {
    name: "Metal Temp",
    measurement: "56",
    unit: "℃",
  },
  {
    name: "Pressure",
    measurement: "0.0",
    unit: "bar",
  },
  {
    name: "Flow Rate",
    measurement: "0.0",
    unit: "ml/s",
  },
  {
    name: "Shot Time",
    measurement: "0.0",
    unit: "s",
  },
  {
    name: "Weight",
    measurement: "0.0",
    unit: "g",
  },
];

const Metrics = () => (
  <div tw="">
    <header tw="pb-8">
      <h1 tw="text-large">Espresso</h1>
      <p tw="text-normal text-medium-grey">Warming up</p>
    </header>

    <Divider />

    <Link to="#" tw="flex justify-between py-8 text-medium">
      <span>Best overall pressure</span>
      <span>&rarr;</span>
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
  </div>
);

const Divider = () => <hr tw="border-t border-heavy-grey w-full" />;

interface MeasurementProps {
  name: string;
  measurement: string;
  unit: string;
}

const Measurement: React.FC<MeasurementProps> = ({
  name,
  measurement,
  unit,
}) => (
  <div>
    <h3 tw="mb-2 text-tiny uppercase text-medium-grey">{name}</h3>
    <p tw="text-3xl">
      <span tw="pr-2">{measurement}</span>
      <span tw="text-medium-grey">{unit}</span>
    </p>
  </div>
);

export default Metrics;
