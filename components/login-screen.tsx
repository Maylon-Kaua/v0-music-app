"use client"
import { useState } from "react"
import { Sparkles, Waves, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function LoginScreen() {
  const { loginWithSpotify } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSpotifyLogin = async () => {
    setIsLoading(true)
    try {
      const success = await loginWithSpotify()
      if (!success) {
        alert("Falha ao conectar com o Spotify. Por favor, tente novamente.")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Erro ao fazer login. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
            <Waves className="size-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-xl">JamWave</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
            <Sparkles className="size-4 text-accent" />
            <span className="text-muted-foreground">Spatial Audio • Collaborative Sessions • Real-time Effects</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Ouça música de um <span className="text-primary">jeito novo</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            Conecte sua conta Spotify, importe suas playlists, transforme com efeitos 8D/16D e crie sessões
            colaborativas com seus amigos.
          </p>

          <div className="max-w-md mx-auto pt-4">
            <Button
              onClick={handleSpotifyLogin}
              disabled={isLoading}
              size="lg"
              className="w-full text-lg h-14 gap-2 group bg-[#1DB954] hover:bg-[#1ed760] text-white"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              {isLoading ? "Conectando..." : "Entrar com Spotify"}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Você será redirecionado para fazer login no Spotify</p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 pt-12">
            <div className="space-y-2">
              <div className="size-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                <Waves className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">Efeitos 8D/16D</h3>
              <p className="text-sm text-muted-foreground">Audio espacial imersivo</p>
            </div>

            <div className="space-y-2">
              <div className="size-12 mx-auto bg-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="size-6 text-accent" />
              </div>
              <h3 className="font-semibold">Equalizador Pro</h3>
              <p className="text-sm text-muted-foreground">Controle total do som</p>
            </div>

            <div className="space-y-2">
              <div className="size-12 mx-auto bg-secondary/10 rounded-xl flex items-center justify-center">
                <Users className="size-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold">Jam Sessions</h3>
              <p className="text-sm text-muted-foreground">Ouça com amigos em grupo</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">Feito com ❤️ para amantes de música</footer>
    </div>
  )
}
