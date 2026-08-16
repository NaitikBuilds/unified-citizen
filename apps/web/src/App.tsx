import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AppRouter } from './router/AppRouter'

/**
 * Application root: shared auth provider + router.
 * ToastProvider wraps this in main.tsx.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App