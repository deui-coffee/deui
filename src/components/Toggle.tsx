import React, { ReactNode } from "react";
import tw from "twin.macro";

interface ToggleContainerProps {
  children: ReactNode;
  isOn: boolean;
  showDot?: boolean;
}

export const ToggleContainer: React.FC<ToggleContainerProps> = ({
  children,
  isOn,
  showDot = false,
}) => (
  <div
    css={[
      tw`relative flex justify-between w-full h-full gap-2 before:(content transition-all duration-300 absolute rounded-md width[calc(50% - 4px)] h-full dark:bg-darkish-grey light:bg-off-white)`,
      isOn ? tw`before:left-0` : tw`before:left[calc(50% + 4px)]`,
      showDot &&
        tw`after:(content transition-all duration-300 absolute top-2 w-2 h-2 rounded-full)`,
      isOn && showDot
        ? tw`after:(bg-green right[calc(50% + 12px)])`
        : tw`after:(bg-red right-2)`,
    ]}
  >
    {children}
  </div>
);

interface ToggleButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  selected,
  onClick,
}) => (
  <button
    onClick={onClick}
    css={[
      tw`z-10 flex items-center justify-center w-full h-full text-normal`,
      selected
        ? tw` dark:text-lighter-grey light:text-darker-grey`
        : tw`dark:text-medium-grey light:text-light-grey`,
    ]}
  >
    {label}
  </button>
);
