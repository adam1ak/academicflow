import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {

  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'))

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage setIsLogged={setIsLogged} />} />
        <Route path="/dashboard" element={isLogged ? <DashboardPage setIsLogged={setIsLogged} /> : <Navigate to="/login" />} />
        <Route path="/*" element={<Navigate to ={isLogged ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
