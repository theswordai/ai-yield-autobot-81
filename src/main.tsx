import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'

// Apply persisted theme BEFORE first paint to avoid flash.
// Default = "dark" so the existing experience is preserved for first-time visitors.
(function initTheme() {
  try {
    const saved = localStorage.getItem('theme');
    const theme = saved === 'dark' ? 'dark' : 'light';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch {
    document.documentElement.classList.remove('dark');
  }
})();

console.log('Main.tsx loading - React available:', !!React);

// Hard gate: if this device has any cached ACL entry, do not mount React.
function isDeviceDenied(): boolean {
  try {
    const raw = localStorage.getItem('acl_cache');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) && arr.length > 0;
  } catch {
    return false;
  }
}

if (isDeviceDenied()) {
  document.documentElement.setAttribute('data-blocked', '1');
} else {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
}
