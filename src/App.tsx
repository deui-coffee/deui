import React from "react";
import { Route, Routes } from "react-router-dom";
import "twin.macro";
import Layout from "./Layout";
import Metrics from "./Metrics";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Metrics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profiles" element={<Profiles />} />

        {/* TODO 404. */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
};

const Settings = () => (
  <div>
    <h1>Settings</h1>
  </div>
);

const Profiles = () => (
  <div>
    <h1>All profiles</h1>
  </div>
);

export default App;
