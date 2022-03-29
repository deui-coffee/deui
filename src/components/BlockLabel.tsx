import React, { ReactNode } from "react";
import "twin.macro";

interface BlockLabelProps {
  children: ReactNode;
}

const BlockLabel: React.FC<BlockLabelProps> = ({ children }) => (
  <h3 tw="flex justify-between mb-2 uppercase text-tiny dark:text-medium-grey light:text-light-grey">
    {children}
  </h3>
);

export default BlockLabel;
