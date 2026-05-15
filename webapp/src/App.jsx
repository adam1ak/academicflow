import { useState } from 'react'
import { login } from './services/api'

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const data = await login(email, password)
      console.log("Login succeed, token: ", data.access_token)


    } catch (e) {
      console.log("Login error: ", e)
    }
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
