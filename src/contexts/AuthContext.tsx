import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/auth'
import type { UserMe, Role } from '../types/auth'

interface AuthContextType {
  user: UserMe | null
  isLoading: boolean
  isAdmin: boolean
  isTeacher: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('escola_token')
    if (token) {
      authService.me()
        .then(setUser)
        .catch(() => localStorage.removeItem('escola_token'))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    await authService.login({ email, password })
    const me = await authService.me()
    setUser(me)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === 'ADMIN',
      isTeacher: user?.role === 'TEACHER',
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
