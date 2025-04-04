import { useEffect, useState } from "react";
import FileExplorer from './components/FileExplorer';
import ExtractImages from './components/ExtractImages';
import ExtractMetaData from './components/ExtractMetaData';
import { BrowserRouter, HashRouter, Routes, Route, Outlet, Link } from "react-router";
import MetadataEditor from "./components/MetadataEditor";
import Split from "./components/Split";
import Merge from "./components/Merge";


// Persistent Navbar Component (always on the left)
const Navbar = () => (
  <div className="w-1/4">
    <h3 className="text-3xl font-bold underline">Navbar</h3>
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="extract-images">Extract Images</Link></li>
      <li><Link to="metadata">Edit Metadata</Link></li>
      <li><Link to="split">Split</Link></li>
      <li><Link to="merge">Merge</Link></li>

    </ul>
  </div>
);

// Sample Pages
const Home = () => (
  <div>
    <h2>Home Page</h2>
    <p>Welcome to the home page!</p>
  </div>
);

const About = () => (
  <div>
    <h2>About Page</h2>
    <p>Learn more about us on this page.</p>
  </div>
);

const Contact = () => (
  <div>
    <h2>Contact Page</h2>
    <p>Get in touch with us.</p>
  </div>
);

// Layout component that always displays Navbar and CustomComponent
const Layout = () => (
  <div className="flex min-h-screen overflow-hidden">
    <Navbar />
    <div className="flex-1 p-4 overflow-auto">
      <Outlet />
    </div>
    {/* <FileExplorer /> */}
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
