// import { useEffect, useState } from "react";
//import FileExplorer from './components/FileExplorer';
import ExtractImages from './components/ExtractImages';
import { HashRouter, Routes, Route, Outlet } from "react-router";
// import Home from "./components/Home";
// import MetadataEditor from "./components/MetadataEditor";
// import Split from "./components/Split";
// import Merge from "./components/Merge";
import NavBar from "./components/NavBar";
// import Thumbnail from "./components/Thumbnail";
// import ExtractPTEX from "./components/ExtractPTEX";
// import Test from './components/Test';
// import ArrangePagesString from './components/ArrangePagesString';


import MetadataWorker from './components/MetadataWorker';
import ExtractImagesWorker from './components/ExtractImagesWorker';
import SelectPagesWorker from './components/SelectPagesWorker';
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
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="extract-images" element={<ExtractImages />} />
          <Route path="metadata" element={<MetadataEditor />} />
          <Route path="ptex" element={<ExtractPTEX />} />
          <Route path="split" element={<Split />} />
          <Route path="merge" element={<Merge />} />
          <Route path="thumbnail" element={<Thumbnail />} />
          <Route path="test" element={<Test />} />
          <Route path="arrange-pages" element={<ArrangePagesString />} /> */}
          <Route path="metadata-worker" element={<MetadataWorker />} />
          <Route path="extract-images-worker" element={<ExtractImagesWorker />} />
          <Route path="select-pages-worker" element={<SelectPagesWorker />} />
        </Route>
      </Routes>
    </HashRouter>
  );

}

export default App;
