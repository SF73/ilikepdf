import { useWorkerStatus } from '../context/WorkerStatusContext';

const StatusBar = () => {
  const { status, error } = useWorkerStatus();

  return (
    // <div className="text-sm text-gray-600">
    <div className="opacity-50 fixed bottom-1 right-1 bg-white px-4 py-2 text-xs text-gray-700 rounded max-w-xs text-center z-50">
      {status === "starting" && <p>🚀 Starting background worker...</p>}
      {status === "busy" && <p>⏳ Processing...</p>}
      {status === "ready" && <p>✅ Ready</p>}
      {status === "error" && <p className="text-red-600">❌ Error: {error}</p>}
    </div>
  );
};

export default StatusBar;
