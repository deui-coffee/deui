import React from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import "twin.macro";
import DemoThing from "./DemoThing";
import Metrics from "./Metrics";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Metrics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profiles" element={<Profiles />} />
        <Route path="test" element={<DemoThing />} />

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

const Layout = () => (
  <div tw="h-screen font-lab-grotesque light:(bg-off-white text-darker-grey) dark:(bg-dark-grey text-lighter-grey)">
    <nav tw="w-full fixed bottom-0 light:(bg-off-white bg-opacity-80 backdrop-blur text-darker-grey) dark:(bg-dark-grey bg-opacity-80 backdrop-blur text-lighter-grey)">
      <ul tw="flex flex-row pt-8 pb-8">
        <li tw="flex-1 text-center">
          <Link to="/settings">Settings</Link>
        </li>
        <li tw="flex-1 text-center">
          <Link to="/">Home</Link>
        </li>
        <li tw="flex-1 text-center">
          <Link to="/profiles">Profiles</Link>
        </li>
      </ul>
    </nav>

    <main tw="p-14">
      <Outlet />
    </main>
  </div>
);

export default App;
