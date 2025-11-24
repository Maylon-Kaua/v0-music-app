"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { SpotifyOAuth } from "@/lib/spotify-oauth"

interface User {
  id: string
  displayName: string
  email: string
  imageUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  loginWithSpotify: () => Promise<boolean>
  logout: () => void
  spotifyAuth: SpotifyOAuth
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyAuth] = useState(() => SpotifyOAuth.getInstance())

  useEffect(() => {
    const loadUser = async () => {
      if (spotifyAuth.hasValidToken()) {
        const profile = await spotifyAuth.getUserProfile()
        if (profile) {
          setUser(profile)
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [spotifyAuth])

  const loginWithSpotify = async () => {
    try {
      const success = await spotifyAuth.login()
      if (success) {
        const profile = await spotifyAuth.getUserProfile()
        if (profile) {
          setUser(profile)
          return true
        }
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    spotifyAuth.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithSpotify, logout, spotifyAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
