import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.mjs';
import { tasks } from './tasks/index.js';

postMessage({ status: "starting" });
const pyodide = await loadPyodide();
pyodide.setStdout({ batched: (msg) => console.log(msg) });
await pyodide.loadPackage("micropip");
await pyodide.loadPackage("pymupdf");
const match = self.location.pathname.match(/\/[^/]*\//);
const basePath = match ? match[0] : '/';
const fullBaseUrl = self.location.origin + basePath;

const url = `${fullBaseUrl}/pyodide_packages/pdftoolbox.tar.gz?t=` + Date.now();
const response = await fetch(url);

const buffer = await response.arrayBuffer();
await pyodide.unpackArchive(buffer, "gztar");
const pdftoolbox = pyodide.pyimport("pdftoolbox");

console.log(pdftoolbox.header());


const pymupdf = pyodide.pyimport("pymupdf");
postMessage({ status: "ready" });


onmessage = async (e) => {
  const { id, type, payload } = e.data;

  try {
    if (!tasks[type]) throw new Error(`Unknown task: ${type}`);

    postMessage({ id, status: "busy" });

    const reportProgress = (percent, message = "") => {
      postMessage({ id, status: "progress", percent, message });
    };

    const result = await tasks[type]({ ...payload, id, reportProgress, pyodide, pymupdf, pdftoolbox});
    postMessage({ id, status: "done", result });
    postMessage({ status: "ready" });
  } catch (error) {
    postMessage({ id, status: "error", error: error.message });
    postMessage({ status: "ready" });
  }
};