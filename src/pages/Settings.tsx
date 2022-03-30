import { css } from "@emotion/react";
import useLocalStorage from "@rehooks/local-storage";
import React, { useState } from "react";
import tw from "twin.macro";
import BlockLabel from "../components/BlockLabel";

const Settings = () => (
  <div tw="flex flex-col gap-8">
    <WaterLevel volume={610} />

    <ScaleConnect />

    <Theme />
  </div>
);

interface WaterLevelProps {
  volume: number;
}

const blockStyles = tw`relative flex items-center justify-center h-20 overflow-hidden rounded-lg dark:bg-black light:bg-white`;

const WaterLevel: React.FC<WaterLevelProps> = () => {
  const [volume, setVolume] = useState(0);

  return (
    <article>
      <BlockLabel>
        <span>Water tank</span>
        <span>1.5L max</span>
      </BlockLabel>
      <div
        onClick={() => setVolume(Math.floor(Math.random() * 1500))}
        css={[
          blockStyles,
          tw`before:(content absolute transition-all duration-500 left-0 h-full dark:bg-dark-blue light:bg-blue)`,
          css`
            &:before {
              width: ${volume / 15}%;
            }
          `,
        ]}
      >
        <p tw="z-10 text-normal">
          <span tw="dark:text-lighter-grey light:text-darker-grey">
            {volume}
          </span>
          <span tw="dark:text-medium-grey light:text-light-grey"> ml</span>
        </p>
      </div>
    </article>
  );
};

const ScaleConnect: React.FC = () => {
  const [scale, setScale] = useState<string | null>();
  const isConnected = !!scale;

  return (
    <article>
      <BlockLabel>Scale</BlockLabel>
      <div
        onClick={() => (scale ? setScale(null) : setScale("Skale 2"))}
        css={[
          blockStyles,
          tw`after:(content transition-all duration-300 absolute rounded-full top-2 right-2 h-2 w-2)`,
          isConnected ? tw`after:bg-green` : tw`after:bg-red`,
        ]}
      >
        <p tw="text-normal">
          <span
            css={
              isConnected
                ? tw`dark:text-lighter-grey light:text-darker-grey`
                : tw`dark:text-medium-grey light:text-light-grey`
            }
          >
            {isConnected ? scale : "Connect"}
          </span>
        </p>
      </div>
    </article>
  );
};

const Theme = () => {
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("theme", "dark");

  return (
    <article>
      <BlockLabel>Power</BlockLabel>
      <div css={[blockStyles, tw`p-3`]}>
        <div
          css={[
            tw`relative flex justify-between w-full h-full gap-2 after:(content transition-all duration-300 absolute rounded-md width[calc(50% - 4px)] h-full dark:bg-darkish-grey light:bg-off-white)`,
            theme === "dark"
              ? tw`after:left-0`
              : tw`after:left[calc(50% + 4px)]`,
          ]}
        >
          <button
            onClick={() => setTheme("dark")}
            css={[
              tw`z-10 flex items-center justify-center w-full h-full text-normal`,
              theme === "dark"
                ? tw` dark:text-lighter-grey light:text-darker-grey`
                : tw`dark:text-medium-grey light:text-light-grey`,
            ]}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            css={[
              tw`z-10 flex items-center justify-center w-full h-full text-normal`,
              theme === "light"
                ? tw` dark:text-lighter-grey light:text-darker-grey`
                : tw`dark:text-medium-grey light:text-light-grey`,
            ]}
          >
            Light
          </button>
        </div>
      </div>
    </article>
  );
};

export default Settings;
