"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, Music, Copy, Check } from "lucide-react"
import { QueueList } from "@/components/queue-list"
import type { Track } from "./main-app"

interface JamSessionProps {
  queue: Track[]
  currentTrack: Track | null
  onUpdateQueue: (queue: Track[]) => void
  user: { id: string; username: string }
}

export function JamSession({ queue, currentTrack, onUpdateQueue, user }: JamSessionProps) {
  const [sessionCode, setSessionCode] = useState("")
  const [isInSession, setIsInSession] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState<string[]>([user.username])

  const createSession = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setSessionCode(code)
    setIsInSession(true)
    setParticipants([user.username])
  }

  const joinSession = () => {
    if (joinCode.length === 6) {
      setSessionCode(joinCode)
      setIsInSession(true)
      // Simulate joining - in real app would sync via WebSocket
      setParticipants((prev) => [...prev, user.username])
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const leaveSession = () => {
    setIsInSession(false)
    setSessionCode("")
    setJoinCode("")
    setParticipants([])
  }

  if (isInSession) {
    return (
      <div className="p-6 space-y-6">
        <Card className="bg-accent-vibrant/5 border-accent-vibrant/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Jam Session Ativa</CardTitle>
                <CardDescription>Compartilhe o código com seus amigos</CardDescription>
              </div>
              <Button variant="destructive" onClick={leaveSession}>
                Sair
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-background border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Código da Sessão</p>
                <p className="text-3xl font-bold tracking-wider text-accent-vibrant">{sessionCode}</p>
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent" onClick={copyCode}>
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {participants.length} {participants.length === 1 ? "ouvinte" : "ouvintes"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{participants.join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <QueueList queue={queue} currentTrack={currentTrack} onUpdateQueue={onUpdateQueue} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-12 px-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-balance">Ouça Música em Grupo</h1>
        <p className="text-lg text-muted-foreground text-pretty">Crie uma jam session ou entre em uma existente</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:border-accent-vibrant/50 transition-colors cursor-pointer" onClick={createSession}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-accent-vibrant/10 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-accent-vibrant" />
            </div>
            <CardTitle>Criar Sessão</CardTitle>
            <CardDescription>Inicie uma nova jam session e convide amigos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-accent-vibrant/50 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-accent-vibrant/10 flex items-center justify-center mb-3">
              <Music className="w-6 h-6 text-accent-vibrant" />
            </div>
            <CardTitle>Entrar em Sessão</CardTitle>
            <CardDescription>Digite o código da sessão para participar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Código da sessão"
                className="uppercase"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinSession()}
              />
              <Button
                className="bg-accent-vibrant hover:bg-accent-vibrant/90"
                onClick={joinSession}
                disabled={joinCode.length !== 6}
              >
                Entrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
