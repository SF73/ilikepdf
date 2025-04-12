const worker = new Worker(new URL("../workers/pyWorker.mjs", import.meta.url), { type: "module" });
console.log("[Main → Worker]:", worker);
worker.addEventListener("message", (e) => {
    console.log("[Main → Received from worker]:", e.data);
  });

worker.addEventListener("error", (err) => {
console.error("[Main → Worker Error]:", err.message, err);
});

export function runTask(type, payload) {
  const id = crypto.randomUUID();

  const listeners = {
    onPartial: () => {},
    onProgress: () => {},
  };

  const promise = new Promise((resolve, reject) => {
    const handleMessage = (e) => {
      const { id: resId, status, result, error, percent, message, ...rest } = e.data;
      if (resId !== id) return;

      if (status === "progress") {
        listeners.onProgress?.(percent, message);
        return;
      }

      if (status === "partial") {
        listeners.onPartial?.(rest);
        return;
      }

      if (status === "done") {
        resolve(result);
        cleanup();
      } else if (status === "error") {
        reject(new Error(error));
        cleanup();
      }

      function cleanup() {
        worker.removeEventListener("message", handleMessage);
      }
    };

    worker.addEventListener("message", handleMessage);
    worker.postMessage({ id, type, payload, id }, getTransferables(payload));
  });

  promise.onPartial = (cb) => {
    listeners.onPartial = cb;
    return promise;
  };

  promise.onProgress = (cb) => {
    listeners.onProgress = cb;
    return promise;
  };

  return promise;
}

  
  function getTransferables(payload) {
    const buffers = [];
  
    const collectBuffers = (obj) => {
      if (!obj || typeof obj !== "object") return;
      for (const val of Object.values(obj)) {
        if (val instanceof ArrayBuffer) {
          buffers.push(val);
        } else if (val && typeof val === "object") {
          collectBuffers(val);
        }
      }
    };
  
    collectBuffers(payload);
    return buffers;
  }
  