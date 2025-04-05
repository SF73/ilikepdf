import { useEffect, useState } from "react";
import FileExplorer from './components/FileExplorer';
import ExtractImages from './components/ExtractImages';
import ExtractMetaData from './components/ExtractMetaData';
import { HashRouter, Routes, Route, Outlet } from "react-router";
import MetadataEditor from "./components/MetadataEditor";
import Split from "./components/Split";
import Merge from "./components/Merge";
import NavBar from "./components/NavBar";
import Home from "./components/Home";

// Layout component that always displays Navbar and CustomComponent
const Layout = () => (
  <div className="flex flex-col sm:flex-row min-h-screen">
    <NavBar />
    <div className="flex-1 p-4 overflow-auto">
      <Outlet />
    </div>
  </div>
);

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="extract-images" element={<ExtractImages />} />
          <Route path="metadata" element={<MetadataEditor />} />
          <Route path="split" element={<Split />} />
          <Route path="merge" element={<Merge />} />
        </Route>
      </Routes>
    </HashRouter>
  );

}

export default App;
