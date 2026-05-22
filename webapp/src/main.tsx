import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { AuthProvider } from './context/AuthContext.tsx'
import { ErrorContextProvider } from './context/ErrorContext.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorContextProvider>
  </StrictMode>
)
