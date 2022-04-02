import React from "react";
import tw from "twin.macro";
import BlockLabel from "../../components/BlockLabel";
import { useTheme } from "../../hooks/useTheme";
import { blockStyles } from "./Settings";

export const ThemeToggle = () => {
  const [theme, setTheme] = useTheme();

  return (
    <article>
      <BlockLabel>Theme</BlockLabel>
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
