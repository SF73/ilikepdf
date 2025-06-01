import { exec } from "child_process";
import chokidar from "chokidar";


const WATCHED_DIR = "src/python/pdftoolbox";
const OUTPUT_FILE = "public/pyodide_packages/pdftoolbox.tar.gz";

function buildTar() {
  exec(
    `tar -czf ${OUTPUT_FILE} -C src/python pdftoolbox`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Tar error:", err);
      } else {
        console.log(`✅ Rebuilt ${OUTPUT_FILE}`);
      }
    }
  );
}

if (process.argv.includes("--watch")) {
  const watcher = chokidar.watch(WATCHED_DIR, {
    ignored: /^\./,
    persistent: true,
  });
  watcher.on("add", buildTar);
  watcher.on("change", buildTar);
  console.log("👀 Watching Python package...");
}

buildTar(); // always build at start
