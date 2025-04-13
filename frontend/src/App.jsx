import { HashRouter, Routes, Route, Outlet } from "react-router";
import NavBar from "./components/NavBar";

import MetadataWorker from './components/MetadataWorker';
import ExtractImagesWorker from './components/ExtractImagesWorker';
import SelectPagesWorker from './components/SelectPagesWorker';
import HomeWorker from './components/HomeWorker';
import StatusBar from './components/StatusBar';
import MergeWorker from './components/MergeWorker';

const Layout = () => (
  <div className="flex flex-col sm:flex-row min-h-screen">
    <NavBar />
    <div className="flex-1 p-4 overflow-auto">
      <Outlet />
    </div>
    <StatusBar />
  </div>
);

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeWorker />} />
          <Route path="metadata-worker" element={<MetadataWorker />} />
          <Route path="extract-images-worker" element={<ExtractImagesWorker />} />
          <Route path="select-pages-worker" element={<SelectPagesWorker />} />
          <Route path="merge-worker" element={<MergeWorker />} />
        </Route>
      </Routes>
    </HashRouter>
  );

}

export default App;
