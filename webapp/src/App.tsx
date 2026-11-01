import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import api from './api/client'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'

import { useAuth } from './context/AuthContext'
import { useError } from './context/ErrorContext'

import ProtectedRoute from './components/auth/ProtectedRoute'
import ToastContainer from './components/ui/ToastContainer'

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
                const rawDetail = parsed.detail
                const msg = Array.isArray(rawDetail) ? rawDetail[0]?.msg : rawDetail
                showError(msg || "Error from server")
              } catch {
                showError("Error from server")
              }
            })
          } else {
            const rawDetail = error.response.data?.detail
            const errorMessage = Array.isArray(rawDetail)
              ? rawDetail[0]?.msg || "Validation error"
              : rawDetail || "Error from server"
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
      <div className="h-screen w-screen bg-bg flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
        <span className="font-mono text-xs text-sec tracking-wide">Verifying session...</span>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        <Route path="/login" element={isLogged ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isLogged ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to={isLogged ? "/dashboard" : "/login"} />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App
