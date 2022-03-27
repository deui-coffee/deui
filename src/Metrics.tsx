import React from "react";
import { Link } from "react-router-dom";
import "twin.macro";

const data = [
    {
      name: "Metal Temp",
      measurement: "56",
      unit: "℃"
    },
    {
      name: "Pressure",
      measurement: "0.0",
      unit: "bar"
    },
    {
      name: "Flow Rate",
      measurement: "0.0",
      unit: "ml/s"
    },
    {
      name: "Shot Time",
      measurement: "0.0",
      unit: "s"
    },
    {
      name: "Weight",
      measurement: "0.0",
      unit: "g"
    }
];

const Metrics = () => (
  <div tw="p-12 h-screen">
    <header tw="pb-8">
      <h1 tw="text-3xl">Espresso</h1>
      <p tw="text-base text-medium-grey">Warming up</p>
    </header>
    <Link to="#" tw="text-xl pt-8 pb-8 mb-8 border-t-2 border-b-2 border-heavy-grey flex justify-between">
      <span>Best overall pressure</span>
      <span>&rarr;</span>
    </Link>

    { data.map( measure => (
      <Measurement
        name={measure.name}
        measurement={measure.measurement}
        unit={measure.unit}
      />
    )) }
  </div>
);

const Measurement = (props) => (
  <div tw="mb-8">
    <h3 tw="uppercase text-xs text-medium-grey">{props.name}</h3>
    <p tw="text-3xl">
      <span tw="pr-2">{props.measurement}</span>
      <span tw="text-medium-grey">{props.unit}</span>
    </p>
  </div>
)

export default Metrics;
