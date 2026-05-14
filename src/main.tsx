import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error Caught:", message, "at", source, ":", lineno, ":", colno, error);
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled Promise Rejection:", event.reason);
};

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error("Root Rendering Error:", error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Hệ thống gặp lỗi khởi động</h1>
      <p>Vui lòng kiểm tra Console log hoặc cấu hình môi trường.</p>
    </div>
  `;
}

