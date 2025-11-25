"use client"

import { useState, useEffect } from "react"
import { MainApp } from "@/components/main-app"
import { LoginScreen } from "@/components/login-screen"

export default function Home() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("soundspace_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (username: string) => {
    const newUser = {
      id: Math.random().toString(36).substring(7),
      username,
    }
    localStorage.setItem("soundspace_user", JSON.stringify(newUser))
    setUser(newUser)
  }

  const handleLogout = () => {
    localStorage.removeItem("soundspace_user")
    setUser(null)
  }

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-vibrant mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <MainApp user={user} onLogout={handleLogout} />
}
