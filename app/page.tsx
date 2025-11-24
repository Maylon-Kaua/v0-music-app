"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginScreen } from "@/components/login-screen"
import { AppShell } from "@/components/app-shell"
import { SpotifySetupScreen } from "@/components/spotify-setup-screen"
import { SpotifyOAuth } from "@/lib/spotify-oauth"

export default function Home() {
  const { user, isLoading, loginWithSpotify } = useAuth()
  const [isSpotifyConfigured, setIsSpotifyConfigured] = useState(false)
  const [checkingConfig, setCheckingConfig] = useState(true)
  const [shouldAutoLogin, setShouldAutoLogin] = useState(false)

  useEffect(() => {
    // Check if Spotify is configured
    const configured = SpotifyOAuth.isConfigured()
    setIsSpotifyConfigured(configured)
    setCheckingConfig(false)
  }, [])

  useEffect(() => {
    if (shouldAutoLogin && isSpotifyConfigured && !user && !isLoading) {
      loginWithSpotify()
      setShouldAutoLogin(false)
    }
  }, [shouldAutoLogin, isSpotifyConfigured, user, isLoading, loginWithSpotify])

  if (isLoading || checkingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isSpotifyConfigured) {
    return (
      <SpotifySetupScreen
        onComplete={() => {
          setIsSpotifyConfigured(true)
          setShouldAutoLogin(true)
        }}
      />
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <AppShell />
}
