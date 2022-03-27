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
      <h1 tw="text-3xl">Espresso</h1>
      <p tw="text-base text-medium-grey">Warming up</p>
    </header>
    <Link
      to="#"
      tw="flex justify-between pt-8 pb-8 mb-8 text-xl border-t-2 border-b-2 border-heavy-grey"
    >
      <span>Best overall pressure</span>
      <span>&rarr;</span>
    </Link>

    <div tw="flex flex-col gap-8">
      {data.map((measure) => (
        <Measurement
          key={measure.name}
          name={measure.name}
          measurement={measure.measurement}
          unit={measure.unit}
        />
      ))}
    </div>
  </div>
);

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
    <h3 tw="text-xs uppercase text-medium-grey">{name}</h3>
    <p tw="text-3xl">
      <span tw="pr-2">{measurement}</span>
      <span tw="text-medium-grey">{unit}</span>
    </p>
  </div>
);

export default Metrics;
