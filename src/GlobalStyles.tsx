import { css, Global } from "@emotion/react";
import React from "react";
import tw, { GlobalStyles as BaseStyles } from "twin.macro";

const customStyles = css({
  body: {
    ...tw`antialiased`,
  },
});

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
);

export default GlobalStyles;
