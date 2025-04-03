// PyodideProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { loadPyodide } from "pyodide";

// Create the context
const PyodideContext = createContext(null);

// Custom hook for consuming the context
export const usePyodide = () => useContext(PyodideContext);

// Provider component
export const PyodideProvider = ({ children }) => {
  const [pyodide, setPyodide] = useState(null);
  const [mypkg, setMypkg] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function initPyodide() {
      // Load Pyodide from the CDN
      
      let pyodideInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/" });
      console.log("Pyodide loaded");
      console.log(pyodideInstance.FS);
      
      // Load micropip for installing your package
      await pyodideInstance.loadPackage("micropip");

      const micropip = pyodideInstance.pyimport("micropip");
      await micropip.install(`${window.location.origin}/pyodide_packages/pymupdf-1.25.5-cp312-abi3-pyodide_2024_0_wasm32.whl`);
      // await micropip.install(`${window.location.origin}/pyodide_packages/ilikepdfpy-0.1-py3-none-any.whl`);
      
      // Import your package
      let importedPkg = pyodideInstance.pyimport("pymupdf");
      console.log(importedPkg.__version__);

      // Update state and mark loading as done
      setPyodide(pyodideInstance);
      setMypkg(importedPkg);
      setLoading(false);
    }
    initPyodide();
  }, []);

  const reloadPackage = async () => {
    if (pyodide) {
      setLoading(true);
      await micropip.install(`${window.location.origin}/pyodide_packages/ilikepdfpy-0.1-py3-none-any.whl`);
      let micropip = pyodide.pyimport("micropip");
    
      // Remove the package from Python's cache to ensure a fresh import.
      await pyodide.runPythonAsync(`
        import sys
        mods_to_remove = [m for m in sys.modules if m.startswith("ilikepdfpy")]
        for mod in mods_to_remove:
            del sys.modules[mod]
      `);

      micropip.uninstall("ilikepdfpy");
      await micropip.install(packageUrl);

      await pyodide.runPythonAsync(`
        from importlib import reload
        import ilikepdfpy
        reload(ilikepdfpy)
      `);

      let importedPkg = pyodide.pyimport("ilikepdfpy");
      
      setMypkg(importedPkg);
      setLoading(false);
    }
  };


  return (
    <PyodideContext.Provider value={{ pyodide, mypkg, loading, reloadPackage }}>
      {children}
    </PyodideContext.Provider>
  );
};
