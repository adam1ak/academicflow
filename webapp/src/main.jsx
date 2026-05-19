import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import { ErrorContextProvider } from './context/ErrorContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorContextProvider>
  </StrictMode>
)
