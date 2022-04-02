import React from "react";
import tw from "twin.macro";
import { PowerToggle } from "./PowerToggle";
import { ScaleConnect } from "./ScaleConnect";
import { ThemeToggle } from "./ThemeToggle";
import { WaterLevel } from "./WaterLevel";

const Settings = () => (
  <div tw="flex flex-col gap-8">
    <WaterLevel volume={610} />

    <ScaleConnect />

    <ThemeToggle />

    <PowerToggle />
  </div>
);

export const blockStyles = tw`relative flex items-center justify-center h-20 overflow-hidden rounded-lg dark:bg-black light:bg-white`;

export default Settings;
