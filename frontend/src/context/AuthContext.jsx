import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('medassist_token')
    if (!token) {
      setLoading(false)
      return
    }
    client.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('medassist_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const form = new URLSearchParams()
    form.append('username', email.trim().toLowerCase())
    form.append('password', password)
    const res = await client.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('medassist_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(payload) {
    const res = await client.post('/auth/register', payload)
    localStorage.setItem('medassist_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  async function updateProfile(payload) {
    const res = await client.patch('/auth/me', payload)
    setUser(res.data)
    return res.data
  }

  function logout() {
    localStorage.removeItem('medassist_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
