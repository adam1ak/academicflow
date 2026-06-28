import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from './context/AuthContext.tsx'
import { ErrorContextProvider } from './context/ErrorContext.js'
import { PlanProvider } from './context/PlanContext.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary.tsx'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorContextProvider>
          <AuthProvider>
            <PlanProvider>
              <App />
            </PlanProvider>
          </AuthProvider>
        </ErrorContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
