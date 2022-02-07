import React from "react";
import ReactDOM from "react-dom";
import { GlobalStyles } from "twin.macro";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyles />
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
