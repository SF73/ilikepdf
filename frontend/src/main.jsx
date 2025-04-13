import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WorkerStatusProvider } from './context/WorkerStatusContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkerStatusProvider>
      <App />
    </WorkerStatusProvider>
  </StrictMode>,
)