const worker = new Worker(new URL("../workers/pyWorker.mjs", import.meta.url), { type: "module" });
console.log("[Main → Worker]:", worker);

const statusListeners = [];

// Register global worker status listeners (for WorkerStatusContext, etc.)
export const onWorkerStatusChange = (callback) => {
  statusListeners.push(callback);
};

worker.addEventListener("message", (e) => {
  const { status } = e.data;
  if (status) {
    statusListeners.forEach((cb) => cb(status, e.data));
  }
});

worker.addEventListener("error", (err) => {
  console.error("[Main → Worker Error]:", err.message, err);
});

export function runTask(type, payload) {
  const id = crypto.randomUUID();

  const handlers = {
    progress: () => {},
    partial: () => {},
    done: () => {},
    error: () => {},
  };

  const promise = new Promise((resolve, reject) => {
    const handleMessage = (e) => {
      const { id: resId, status, result, error, percent, message, data, ...rest } = e.data;
      if (resId !== id) return;

      if (status === "progress") {
        handlers.progress?.(percent, message);
        return;
      }

      if (status === "partial") {
        handlers.partial?.(data);
        return;
      }

      if (status === "done") {
        handlers.done?.(result);
        resolve(result);
        cleanup();
        return;
      }

      if (status === "error") {
        handlers.error?.(error);
        reject(new Error(error));
        cleanup();
        return;
      }

      function cleanup() {
        worker.removeEventListener("message", handleMessage);
      }
    };

    worker.addEventListener("message", handleMessage);
    worker.postMessage({ id, type, payload, id }, getTransferables(payload));
  });

  // Attach optional callbacks
  promise.onProgress = (cb) => {
    handlers.progress = cb;
    return promise;
  };

  promise.onPartial = (cb) => {
    handlers.partial = cb;
    return promise;
  };

  promise.onDone = (cb) => {
    handlers.done = cb;
    return promise;
  };

  promise.onError = (cb) => {
    handlers.error = cb;
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
