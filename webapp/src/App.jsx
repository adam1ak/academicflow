import { useState } from 'react'
import { login, logout } from './services/api'

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'))


  const handleLogin = async (e) => {
    e.preventDefault()


    try {
      await login(email, password)
      setIsLogged(true)
    } catch (e) {
      console.log("Login error: ", e)
    }

  }

  const handleLogout = () => {
    logout()
    setIsLogged(false)
  }

  if (isLogged) {
    return (
      <div>
        <h1>Login succeed!</h1>
        <button onClick={handleLogout}>Log out</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Logic tests</h1>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Hasło" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default App
