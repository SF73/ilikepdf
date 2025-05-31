import { exec } from "child_process";
import chokidar from "chokidar";

const WATCHED_DIR = "src/python/pdftoolbox";
const OUTPUT_DIR = "public/pyodide_packages";

function buildTar() {
  exec(
    `tar -czf ${OUTPUT_DIR}/pdftoolbox.tar.gz -C src/python pdftoolbox`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Tar error:", err);
      } else {
        console.log("✅ Rebuilt pdftoolbox.tar.gz");
      }
    }
  );
}

const watcher = chokidar.watch(WATCHED_DIR, {
  ignored: /^\./,
  persistent: true,
});

watcher.on("add", buildTar);
watcher.on("change", buildTar);
console.log("👀 Watching Python package in src/python...");
buildTar(); // initial build
