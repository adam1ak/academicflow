import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'

import { verifySession } from './services/auth'

function App() {

  const [isLogged, setIsLogged] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setIsChecking(false)
        return
      }

      try {
        await verifySession()
        setIsLogged(true)
      } catch (error) {
        console.error("Token invalid or expired: ", error)

        setIsLogged(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

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
        <Route path="/login" element={<LoginPage setIsLogged={setIsLogged} />} />
        <Route path="/dashboard" element={isLogged ? <DashboardPage setIsLogged={setIsLogged} /> : <Navigate to="/login" />} />
        <Route path="/*" element={<Navigate to ={isLogged ? "/dashboard" : "/login"} />} />
        <Route path="register" element={isLogged ? <Navigate to="/dashboard" /> : <RegisterPage setIsLogged={setIsLogged} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
