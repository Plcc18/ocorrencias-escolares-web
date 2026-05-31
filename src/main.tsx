import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Sentry (optional) — ativa se VITE_SENTRY_DSN estiver definido
if (import.meta.env.VITE_SENTRY_DSN) {
  /* eslint-disable @typescript-eslint/no-var-requires */
  import('@sentry/react').then(Sentry => {
    import('@sentry/tracing').then(({ BrowserTracing }) => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 0.05,
      })
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
