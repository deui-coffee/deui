import React, { useState } from "react";
import "twin.macro";
import "./DemoThing.css";
import logo from "./logo.svg";
import StylesExample from "./StylesExample";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>

        <StylesExample count={count} />

        <p>count is: {count}</p>
        <button
          tw="px-4 py-1 rounded bg-medium-grey"
          type="button"
          onClick={() => setCount((count) => count + 1)}
        >
          Increment
        </button>

        <p>Testing fonts</p>
        <div tw="text-2xl">
          <p tw="font-regular">
            Regular (<em>Regular italic</em>)
          </p>
          <p tw="font-medium">
            Medium (<em>Medium italic</em>)
          </p>
          <p tw="font-bold">
            Bold (<em>Bold italic</em>)
          </p>
        </div>

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
