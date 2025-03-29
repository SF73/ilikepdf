import { loadPyodide } from "pyodide";

let pyodide;

export async function initPyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/" });
    console.log(pyodide);
    await pyodide.loadPackage("micropip");

    const micropip = pyodide.pyimport("micropip");
    await micropip.install(`${window.location.origin}/pyodide_packages/pymupdf-1.25.3-cp312-abi3-pyodide_2024_0_wasm32.whl`)
    await micropip.install(`${window.location.origin}/pyodide_packages/ilikepdfpy-0.1-py3-none-any.whl`)
  }
  return pyodide;
}
