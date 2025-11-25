"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Music, GripVertical, X, Play } from "lucide-react"
import type { Track } from "./main-app"

interface QueueListProps {
  queue: Track[]
  currentTrack: Track | null
  onUpdateQueue: (queue: Track[]) => void
}

export function QueueList({ queue, currentTrack, onUpdateQueue }: QueueListProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const removeFromQueue = (trackId: string) => {
    onUpdateQueue(queue.filter((t) => t.id !== trackId))
  }

  const moveTrack = (fromIndex: number, toIndex: number) => {
    const newQueue = [...queue]
    const [removed] = newQueue.splice(fromIndex, 1)
    newQueue.splice(toIndex, 0, removed)
    onUpdateQueue(newQueue)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Queue Colaborativa</CardTitle>
            <CardDescription>
              {queue.length === 0
                ? "A fila está vazia. Adicione músicas da sua biblioteca."
                : `${queue.length} música${queue.length !== 1 ? "s" : ""} na fila`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma música na fila
              <br />
              Adicione músicas da sua biblioteca para começar
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {queue.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                    currentTrack?.id === track.id
                      ? "bg-accent-vibrant/10 border border-accent-vibrant/30"
                      : "hover:bg-accent"
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

                  <div className="w-10 h-10 rounded bg-accent-vibrant/10 flex items-center justify-center shrink-0">
                    {currentTrack?.id === track.id ? (
                      <Play className="w-5 h-5 text-accent-vibrant fill-accent-vibrant" />
                    ) : (
                      <Music className="w-5 h-5 text-accent-vibrant" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${currentTrack?.id === track.id ? "text-accent-vibrant" : ""}`}>
                      {track.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {track.duration > 0 ? formatDuration(track.duration) : "--:--"}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromQueue(track.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
