"use client"

import { useState } from "react"
import { Radio, Plus, Users, Music, Copy, LogOut, X, Play, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useJam } from "@/contexts/jam-context"
import { usePlayer } from "@/contexts/player-context"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function JamSessionView() {
  const { currentSession, createSession, joinSession, leaveSession } = useJam()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [sessionCode, setSessionCode] = useState("")

  const handleCreateSession = () => {
    if (!sessionName.trim()) return
    createSession(sessionName)
    setShowCreateDialog(false)
    setSessionName("")
  }

  const handleJoinSession = () => {
    if (!sessionCode.trim()) return
    joinSession(sessionCode)
    setShowJoinDialog(false)
    setSessionCode("")
  }

  if (!currentSession) {
    return (
      <>
        <div className="max-w-2xl mx-auto py-12 px-6">
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <div className="size-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                <Radio className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Jam Session</h2>
              <p className="text-muted-foreground leading-relaxed">
                Crie ou entre em uma sessão colaborativa para ouvir música junto com seus amigos. Todos podem adicionar
                músicas à fila e controlar a reprodução.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => setShowCreateDialog(true)} className="gap-2 w-full sm:w-auto">
                <Plus className="size-5" />
                Criar Sessão
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowJoinDialog(true)}
                className="gap-2 w-full sm:w-auto"
              >
                <Users className="size-5" />
                Entrar em Sessão
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="size-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                    <Music className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Queue Compartilhada</h3>
                  <p className="text-sm text-muted-foreground">Todos podem adicionar músicas</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="size-12 mx-auto bg-accent/10 rounded-xl flex items-center justify-center">
                    <Users className="size-6 text-accent" />
                  </div>
                  <h3 className="font-semibold">Sincronizado</h3>
                  <p className="text-sm text-muted-foreground">Ouçam juntos em tempo real</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="size-12 mx-auto bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Radio className="size-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold">Controle Colaborativo</h3>
                  <p className="text-sm text-muted-foreground">Compartilhem a experiência</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Create Session Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Sessão</DialogTitle>
              <DialogDescription>Dê um nome para sua sessão e compartilhe o código com seus amigos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Nome da sessão (ex: Friday Night Vibes)"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
              />
              <Button onClick={handleCreateSession} className="w-full" size="lg">
                Criar Sessão
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Session Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Entrar em Sessão</DialogTitle>
              <DialogDescription>Digite o código da sessão para entrar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Código da sessão (ex: ABC123)"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                className="uppercase"
              />
              <Button onClick={handleJoinSession} className="w-full" size="lg">
                Entrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return <ActiveJamSession />
}

function ActiveJamSession() {
  const { currentSession, leaveSession, addToQueue, removeFromQueue } = useJam()
  const { playTrack } = usePlayer()
  const { toast } = useToast()

  if (!currentSession) return null

  const copyCode = () => {
    navigator.clipboard.writeText(currentSession.code)
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seus amigos para eles entrarem",
    })
  }

  const handlePlayTrack = (track: any) => {
    playTrack(track)
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Radio className="size-5 text-primary" />
                <h2 className="text-2xl font-bold">{currentSession.name}</h2>
                <Badge variant="secondary">Ao vivo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Host: {currentSession.hostName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={leaveSession}>
              <LogOut className="size-5" />
            </Button>
          </div>

          {/* Session Code */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg p-3 font-mono text-lg font-bold text-center">
              {currentSession.code}
            </div>
            <Button size="icon" variant="outline" onClick={copyCode}>
              <Copy className="size-5" />
            </Button>
          </div>

          {/* Members */}
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Participantes ({currentSession.members.length})
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentSession.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-muted rounded-full pl-1 pr-3 py-1">
                  <Avatar className="size-6">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {member.name}
                    {member.isHost && " 👑"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fila de Reprodução</h3>
            <Badge variant="outline">{currentSession.queue.length} músicas</Badge>
          </div>

          {currentSession.queue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="size-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma música na fila</p>
              <p className="text-sm mt-1">Adicione músicas das suas playlists para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentSession.queue.map((track, index) => (
                <Card
                  key={track.id + index}
                  className={`group ${
                    index === currentSession.currentTrackIndex ? "bg-primary/10 border-primary" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="size-5 text-muted-foreground flex-shrink-0" />

                      <div className="size-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {track.imageUrl ? (
                          <img
                            src={track.imageUrl || "/placeholder.svg"}
                            alt={track.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="size-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">Adicionada por {track.addedByName}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePlayTrack(track)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromQueue(track.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
