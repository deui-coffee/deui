import { css } from "@emotion/react";
import React from "react";
import tw from "twin.macro";

const Settings = () => (
  <>
    <WaterLevel volume={610} />
  </>
);

interface WaterLevelProps {
  volume: number;
}

const WaterLevel: React.FC<WaterLevelProps> = ({ volume }) => (
  <article>
    <h3 tw="flex justify-between mb-2 uppercase text-tiny dark:text-medium-grey light:text-light-grey">
      <span>Water tank</span>
      <span>1.5L max</span>
    </h3>
    <div
      css={[
        tw`relative flex items-center overflow-hidden justify-center h-20 dark:bg-black light:bg-white rounded-lg before:(content absolute left-0 h-full dark:bg-dark-blue light:bg-blue)`,
        css`
          &:before {
            width: ${volume / 15}%;
          }
        `,
      ]}
    >
      <p tw="z-10 text-normal">
        <span tw="dark:text-lighter-grey light:text-darker-grey">{volume}</span>
        <span tw="dark:text-medium-grey light:text-light-grey"> ml</span>
      </p>
    </div>
  </article>
);

export default Settings;
