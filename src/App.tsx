import React from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import "twin.macro";
import DemoThing from "./DemoThing";

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

const Metrics = () => (
  <div>
    <h1>Metrics here</h1>

    <Link to="/test" tw="underline hover:no-underline">
      Page with some styling examples
    </Link>
  </div>
);

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
  <div tw="font-lab-grotesque light:(bg-off-white text-darker-grey) dark:(bg-dark-grey text-lighter-grey) h-screen">
    <nav tw="w-full fixed bottom-0">
      <ul tw="flex flex-row">
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

    <Outlet />
  </div>
);

export default App;
