"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface AuthContextProps {
  user: any // Replace 'any' with your user type
  login: (userData: any) => void // Replace 'any' with your user data type
  logout: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null) // Replace 'any' with your user type

  const login = (userData: any) => {
    // Replace 'any' with your user data type
    setUser(userData)
    // Store user data in local storage or cookies if needed
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    // Remove user data from local storage or cookies
    localStorage.removeItem("user")
  }

  const value: AuthContextProps = {
    user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthProvider, useAuth }
