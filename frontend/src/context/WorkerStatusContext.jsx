import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onWorkerStatusChange } from '../utils/workerClient';

const WorkerStatusContext = createContext();

export const WorkerStatusProvider = ({ children }) => {
  const [status, setStatus] = useState("starting");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [message, setMessage] = useState(null);

  const showTimer = useRef(null);    // Delay before showing "busy"/"progress"
  const hideTimer = useRef(null);    // For delayed ready
  const showBusy = useRef(false);    // Whether to show busy after delay

  const DELAY = 300; // delay before showing busy/progress

  useEffect(() => {
    onWorkerStatusChange((incomingStatus, payload) => {
      if (incomingStatus === "partial") return;
      if (incomingStatus === "error") {
        clearTimeout(showTimer.current);
        clearTimeout(hideTimer.current);
        setStatus("error");
        setError(payload?.error || "Unknown error");
        return;
      }

      if (incomingStatus === "busy" || incomingStatus === "progress") {
        clearTimeout(hideTimer.current);
        showBusy.current = true;
        showTimer.current = setTimeout(() => {
          if (showBusy.current) {
            setStatus("busy");
            if (incomingStatus === "progress") {
              setProgress(payload.percent ?? null);
              setMessage(payload.message ?? null);
            }
          }
        }, DELAY);
        return;
      }

      if (incomingStatus === "ready") {
        // Cancel showing busy if task finished quickly
        clearTimeout(showTimer.current);
        showBusy.current = false;

        hideTimer.current = setTimeout(() => {
          setStatus("ready");
          setProgress(null);
          setMessage(null);
        }, 100); // slight delay for smoother transition (optional)
        return;
      }

      setStatus(incomingStatus);
    });
  }, []);

  return (
    <WorkerStatusContext.Provider value={{ status, error, progress, message }}>
      {children}
    </WorkerStatusContext.Provider>
  );
};

export const useWorkerStatus = () => useContext(WorkerStatusContext);
