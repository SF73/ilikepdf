const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const pythonProjectPath = path.resolve(__dirname, "../../python/ilikepdfpy");
const frontendWheelPath = path.resolve(__dirname, "../public/pyodide_packages");

console.log("🛠 Building Python wheel...");
execSync("python setup.py bdist_wheel", { cwd: pythonProjectPath, stdio: "inherit" });

console.log("📦 Copying wheel to frontend...");
const distDir = path.join(pythonProjectPath, "dist");
const wheelFile = fs.readdirSync(distDir).find(f => f.endsWith(".whl"));
if (!wheelFile) {
  console.error("❌ No wheel file found.");
  process.exit(1);
}

fs.mkdirSync(frontendWheelPath, { recursive: true });
fs.copyFileSync(path.join(distDir, wheelFile), path.join(frontendWheelPath, wheelFile));

// Cleanup
fs.rmSync(path.join(pythonProjectPath, "build"), { recursive: true, force: true });
fs.rmSync(path.join(pythonProjectPath, "dist"), { recursive: true, force: true });
const egg = fs.readdirSync(pythonProjectPath).find(f => f.endsWith(".egg-info"));
if (egg) fs.rmSync(path.join(pythonProjectPath, egg), { recursive: true, force: true });

console.log("✅ Done!");
