import { useEffect, useState } from "react";
import { initPyodide } from "./pyodide-loader";

function App() {
  const [text, setText] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const pyodide = await initPyodide();
      await pyodide.runPythonAsync(`
        #from ilovepdfpy.tools.extract import extract_text
        result = "PDF tool loaded!"
      `);
      setText(pyodide.globals.get("result"));
    })();
  }, []);

  return <div><pre>{text}</pre></div>;
}

export default App;
