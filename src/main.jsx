import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './app/store.js'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { getClerkPublishableKey } from './utils/env'

const PUBLISHABLE_KEY = getClerkPublishableKey()

function MissingKeyFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
      <div style={{ maxWidth: 560, padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>Configuration required</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: '#4b5563' }}>
          The application can’t start because a publishable key is missing.
        </p>
        <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, color: '#4b5563' }}>
          <li>Set one of these environment variables in Netlify:</li>
        </ul>
        <pre style={{ marginTop: 8, background: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, overflow: 'auto' }}>
VITE_CLERK_PUBLISHABLE_KEY=<i>your_key</i>
REACT_APP_CLERK_PUBLISHABLE_KEY=<i>your_key</i>
REACT_APP_PUBLISHABLE_KEY=<i>your_key</i>
        </pre>
        <p style={{ marginTop: 8, fontSize: 13, color: '#4b5563' }}>
          Once added, redeploy the site and this message will disappear.
        </p>
        <a href="/landing" style={{ display: 'inline-block', marginTop: 12, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', textDecoration: 'none' }}>
          Continue to landing
        </a>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </ClerkProvider>
    ) : (
      <MissingKeyFallback />
    )}
  </React.StrictMode>,
)