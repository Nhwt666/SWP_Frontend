// Main Application Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './UserContext';

// Create the root React element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application with context providers
root.render(
    <React.StrictMode>
        <UserProvider>
            <App />
        </UserProvider>
    </React.StrictMode>
);

// Start performance monitoring
reportWebVitals();
