import React from "react";
import { Link } from "react-router-dom";
import "twin.macro";

const Metrics = () => (
  <div tw="p-12">
    <header tw="pb-8">
      <h1 tw="text-3xl">Espresso</h1>
      <p tw="text-base text-medium-grey">Warming up</p>
    </header>
    <Link to="#" tw="text-xl pt-8 pb-8 mb-8 border-t-2 border-b-2 border-heavy-grey flex justify-between">
      <span>Best overall pressure</span>
      <span>&rarr;</span>
    </Link>

    <Measurement
      name="Metal temp"
      measurement="56"
      unit="℃"
    />

    <Measurement
      name="Pressure"
      measurement="0.0"
      unit="bar"
    />
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
