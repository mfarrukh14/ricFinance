import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
    const storedTheme = localStorage.getItem('theme');
    const theme = storedTheme || 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
} catch {
    // ignore
}

createRoot(document.getElementById('root')).render(
    <App />
)
