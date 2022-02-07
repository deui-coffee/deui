import { css } from "@emotion/react";
import { useState } from "react";
import tw from "twin.macro";
import "./App.css";
import logo from "./logo.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
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
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {" | "}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  );
}

export default App;
