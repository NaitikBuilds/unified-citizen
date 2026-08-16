import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui/Toast'

// Dev-only console hook so mock error states can be exercised manually:
// window.__UCG_MOCK__.setMockFailure('auth.login') / clearMockFailures().
if (import.meta.env.DEV) {
  void import('./mocks/services/mockUtils').then((mockUtils) => {
    ;(window as unknown as {
      __UCG_MOCK__?: {
        setMockFailure: typeof mockUtils.setMockFailure
        clearMockFailures: typeof mockUtils.clearMockFailures
      }
    }).__UCG_MOCK__ = {
      setMockFailure: mockUtils.setMockFailure,
      clearMockFailures: mockUtils.clearMockFailures,
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
