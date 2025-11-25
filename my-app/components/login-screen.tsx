"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music2 } from "lucide-react"

interface LoginScreenProps {
  onLogin: (username: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onLogin(username.trim())
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-vibrant/10 mx-auto">
            <Music2 className="w-10 h-10 text-accent-vibrant" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold tracking-tight">SoundSpace</CardTitle>
            <CardDescription className="text-base mt-2">
              Ouça música com efeitos 8D/16D e compartilhe com amigos
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Escolha um nome de usuário
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent-vibrant hover:bg-accent-vibrant/90 text-white font-semibold"
              disabled={!username.trim()}
            >
              Entrar
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Sistema 100% local. Sem necessidade de contas ou APIs externas.
              <br />
              Suas músicas, suas regras.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
