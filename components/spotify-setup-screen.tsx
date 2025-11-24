"use client"
import { useState } from "react"
import { Settings, ExternalLink, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SpotifySetupScreen({ onComplete }: { onComplete: () => void }) {
  const [clientId, setClientId] = useState("")
  const [step, setStep] = useState<"input" | "saved">("input")

  const handleSave = () => {
    if (!clientId.trim()) {
      alert("Por favor, insira um Client ID válido")
      return
    }

    localStorage.setItem("spotify_client_id", clientId.trim())
    setStep("saved")

    // Automatically trigger Spotify login after saving
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="size-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">Configurar Spotify</CardTitle>
          </div>
          <CardDescription>Configure suas credenciais do Spotify para usar o JamWave</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "input" ? (
            <>
              {/* Instructions */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <p className="font-semibold">Como obter suas credenciais:</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>
                    Acesse o{" "}
                    <a
                      href="https://developer.spotify.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Spotify Developer Dashboard
                      <ExternalLink className="size-3" />
                    </a>
                  </li>
                  <li>Faça login com sua conta Spotify</li>
                  <li>Clique em "Create app" e preencha as informações básicas</li>
                  <li>
                    Em "Redirect URIs", adicione:{" "}
                    <code className="bg-background px-2 py-0.5 rounded text-xs">
                      {typeof window !== "undefined" ? window.location.origin : ""}/spotify-callback
                    </code>
                  </li>
                  <li>Salve as configurações</li>
                  <li>Copie o "Client ID" e cole abaixo</li>
                </ol>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label htmlFor="clientId">Spotify Client ID</Label>
                <Input
                  id="clientId"
                  placeholder="ex: 1234567890abcdef1234567890abcdef"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Suas credenciais são armazenadas apenas localmente no seu navegador
                </p>
              </div>

              <Button onClick={handleSave} size="lg" className="w-full">
                Salvar e Continuar
              </Button>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="size-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <Check className="size-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Configuração salva!</h3>
                <p className="text-sm text-muted-foreground">Redirecionando...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
