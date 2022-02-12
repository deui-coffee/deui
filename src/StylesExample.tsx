import { css } from "@emotion/react";
import React from "react";
import tw from "twin.macro";

interface Props {
  count: number;
}

const StylesExample: React.FC<Props> = ({ count }) => (
  <div tw="bg-gray-700 rounded-xl p-4">
    <h1>Styles example</h1>
    <p
      css={css`
        color: green;
      `}
    >
      This is a run-of-the-mill Emotion style 👩‍🎤
    </p>
    <p tw="font-bold">This is a Twin-macro example 💅</p>
    <p css={[tw`text-yellow-300`, count % 2 === 0 && tw`text-red-700`]}>
      This is a crazy conditional style with Emotion + Twin.macro
    </p>
    <p tw="text-sm">(It which changes when you increase the counter! 🤫)</p>
  </div>
);

export default StylesExample;
