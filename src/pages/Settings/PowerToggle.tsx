import React from "react";
import tw from "twin.macro";
import BlockLabel from "../../components/BlockLabel";
import { blockStyles } from "./Settings";

export const PowerToggle = () => {
  return (
    <article>
      <BlockLabel>Power</BlockLabel>
      <div css={[blockStyles, tw`p-3`]}>lulz</div>
    </article>
  );
};
