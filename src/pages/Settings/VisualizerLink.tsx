import React, { useState } from "react";
import tw from "twin.macro";
import BlockLabel from "../../components/BlockLabel";
import { blockStyles } from "./Settings";

export const VisualizerLink = () => {
  const [link, setLink] = useState<string | null>();

  return (
    <article>
      <BlockLabel>Visualizer</BlockLabel>
      <div
        onClick={() =>
          link ? undefined : setLink("https://visualizer.coffee/")
        }
        css={[
          blockStyles,
          tw`after:(content transition-all duration-300 absolute rounded-full top-2 right-2 h-2 w-2)`,
          link ? tw`after:bg-green` : tw`after:bg-red`,
        ]}
      >
        <p
          css={[
            tw`text-normal`,
            link
              ? tw`dark:text-lighter-grey light:text-darker-grey`
              : tw`dark:text-medium-grey light:text-light-grey`,
          ]}
        >
          {link ? (
            <a href={link} target="_blank" rel="noreferrer noopener">
              View shot
            </a>
          ) : (
            "No shot available"
          )}
        </p>
      </div>
    </article>
  );
};
