"use client"

import { Play, Pause, SkipBack, SkipForward, Volume2, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { usePlayer } from "@/contexts/player-context"
import { formatTime } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    effect8D,
    effect16D,
    togglePlay,
    seek,
    setVolume,
    set8DEffect,
    set16DEffect,
  } = usePlayer()

  if (!currentTrack) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="text-center text-muted-foreground">Selecione uma música para começar</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="space-y-6">
        {/* Track Info */}
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {currentTrack.imageUrl ? (
              <img
                src={currentTrack.imageUrl || "/placeholder.svg"}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Waves className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{currentTrack.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <SkipBack className="size-5" />
          </Button>
          <Button size="icon" className="size-12 rounded-full" onClick={togglePlay}>
            {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <SkipForward className="size-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="size-5 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value / 100)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">{Math.round(volume * 100)}%</span>
        </div>

        {/* Spatial Effects */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Efeito 8D</label>
              <span className="text-sm text-muted-foreground">{Math.round(effect8D * 100)}%</span>
            </div>
            <Slider
              value={[effect8D * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => set8DEffect(value / 100)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Efeito 16D</label>
              <span className="text-sm text-muted-foreground">{Math.round(effect16D * 100)}%</span>
            </div>
            <Slider
              value={[effect16D * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => set16DEffect(value / 100)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
