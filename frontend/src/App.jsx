import { useEffect, useState } from "react";
// import { usePyodide } from './components/PyodideProvider';

import { PyodideProvider } from './components/PyodideProvider';
import FileExplorer from './components/FileExplorer';


// import { initPyodide } from "./pyodide-loader";

function App() {
  // const [text, setText] = useState("Loading...");
  // const { pyodide, reloadPackage, loading } = usePyodide();

  return (
    <PyodideProvider>
      <div>
        <h1>Pyodide File Explorer</h1>
        <FileExplorer path="." />
      </div>
    </PyodideProvider>
  );

  // return <div><pre>{loading ? 'Loading...' : 'Reload Package'}</pre></div>;
}

export default App;
