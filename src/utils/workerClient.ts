import { v4 as uuidv4 } from 'uuid';

type WorkerStatusCallback = (status: string, data: any) => void;

interface TaskHandlers {
  progress?: (percent: number, message?: string) => void;
  partial?: (data: any) => void;
  done?: (result: any) => void;
  error?: (error: string) => void;
}

interface TaskPromise extends Promise<any> {
  onProgress: (cb: (percent: number, message?: string) => void) => TaskPromise;
  onPartial: (cb: (data: any) => void) => TaskPromise;
  onDone: (cb: (result: any) => void) => TaskPromise;
  onError: (cb: (error: string) => void) => TaskPromise;
}

type WorkerState = "initializing" | "idle" | "busy" | "error";
let currentWorkerState: WorkerState = "initializing";
let isWorkerReady = false;



const worker = new Worker(new URL("../workers/pyWorker.mjs", import.meta.url), { type: "module" });
console.log("[Main → Worker]:", worker);

const statusListeners: WorkerStatusCallback[]= [];

export const onWorkerStatusChange = (callback: WorkerStatusCallback) => {
  statusListeners.push(callback);
};

worker.addEventListener("message", (e: MessageEvent) => {
  const { status } = e.data;
  if (status) {
    if (status === "ready") {
      isWorkerReady = true;
      currentWorkerState = "idle";
    } else if (status === "busy") {
      currentWorkerState = "busy";
    } else if (status === "done" || status === "error") {
      currentWorkerState = "idle";
    }

    statusListeners.forEach((cb) => cb(status, e.data));
  }
});

worker.addEventListener("error", (err: ErrorEvent) => {
  console.error("[Main → Worker Error]:", err.message, err);
});

export function runTask(type: string, payload: any, options: { waitForReady?: boolean } = { waitForReady: true }): TaskPromise {
  const id = uuidv4();

  const handlers: TaskHandlers = {
    progress: () => {},
    partial: () => {},
    done: () => {},
    error: () => {},
  };

  const promise = new Promise(async (resolve, reject) => {
    try {
      if (options.waitForReady) {
        await waitForWorkerReady();
        await waitForWorkerIdle();
      }

      const handleMessage = (e: MessageEvent) => {
        const { id: resId, status, result, error, percent, message, data } = e.data;
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
      worker.postMessage({ id, type, payload }, getTransferables(payload));
    } catch (err) {
      reject(err);
    }
  }) as TaskPromise;

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



function getTransferables(payload:any): ArrayBuffer[] {
  const buffers : ArrayBuffer[]= [];

  const collectBuffers = (obj: any) => {
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



export async function waitForWorkerReady() {
  if (isWorkerReady) return;
  return new Promise<void>((resolve) => {
    onWorkerStatusChange((status) => {
      if (status === "ready") {
        resolve();
      }
    });
  });
}

export async function waitForWorkerIdle() {
  if (currentWorkerState === "idle") return;
  return new Promise<void>((resolve) => {
    const listener: WorkerStatusCallback = () => {
      if (currentWorkerState === "idle") {
        resolve();
        statusListeners.splice(statusListeners.indexOf(listener), 1);
      }
    };
    onWorkerStatusChange(listener);
  });
}

export function getWorkerState() {
  return currentWorkerState;
}