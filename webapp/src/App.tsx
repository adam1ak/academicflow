import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import api from './api/client'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'

import { useAuth } from './context/AuthContext'
import { useError } from './context/ErrorContext'

import ProtectedRoute from './components/auth/ProtectedRoute'
import ErrorPopup from './components/ui/ErrorPopup'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface ErrorResponseData {
  detail: string
}

function App() {

  const { isLogged, isChecking } = useAuth()
  const { showError } = useError()

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponseData>) => {
        if (error.response && error.response.status !== 401) {
          if (error.response.data instanceof Blob) {
            error.response.data.text().then(text => {
              try {
                const parsed = JSON.parse(text)
                showError(parsed.detail || "Error from server")
              } catch {
                showError("Error from server")
              }
            })
          } else {
            const errorMessage = error.response.data?.detail || "Error from server"
            showError(errorMessage)
          }
        } else if (!error.response) {
          showError("No connection with backend")
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [showError])

  if (isChecking) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Session verification...</h2>
      </div>
    )
  }

  return (
    <HashRouter>
      <ErrorPopup />

      <Routes>
        <Route path="/login" element={isLogged ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isLogged ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to={isLogged ? "/dashboard" : "/login"} />} />
      </Routes>

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </HashRouter>
  )
}

export default App
