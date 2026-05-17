import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'

import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  const { isLogged, isChecking } = useAuth()

  if (isChecking) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Session verification...</h2>
      </div>
    )
  }

  return (
    <BrowserRouter>
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
