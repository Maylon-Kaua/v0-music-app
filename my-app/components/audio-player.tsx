"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { EqualizerDialog } from "@/components/equalizer-dialog"
import { AudioEffectsDialog } from "@/components/audio-effects-dialog"
import type { Track } from "./main-app"

interface AudioPlayerProps {
  queue: Track[]
  currentTrack: Track | null
  onTrackChange: (track: Track | null) => void
  onQueueChange: (queue: Track[]) => void
}

export function AudioPlayer({ queue, currentTrack, onTrackChange, onQueueChange }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const pannerNodeRef = useRef<PannerNode | null>(null)
  const equalizerNodesRef = useRef<BiquadFilterNode[]>([])

  // Audio effect states - exposed to child components
  const effect8DRef = useRef(false)
  const effect16DRef = useRef(false)
  const effectIntensityRef = useRef(50)
  const effectSpeedRef = useRef(50)
  const animationFrameRef = useRef<number>()

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window === "undefined") return

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = audioContextRef.current

    // Create audio element
    audioRef.current = new Audio()
    audioRef.current.crossOrigin = "anonymous"

    // Create audio nodes
    sourceNodeRef.current = ctx.createMediaElementSource(audioRef.current)
    gainNodeRef.current = ctx.createGain()
    pannerNodeRef.current = ctx.createPanner()

    // Configure panner for spatial audio
    pannerNodeRef.current.panningModel = "HRTF"
    pannerNodeRef.current.distanceModel = "inverse"
    pannerNodeRef.current.refDistance = 1
    pannerNodeRef.current.maxDistance = 10000
    pannerNodeRef.current.rolloffFactor = 1
    pannerNodeRef.current.coneInnerAngle = 360
    pannerNodeRef.current.coneOuterAngle = 0
    pannerNodeRef.current.coneOuterGain = 0

    // Create 10-band equalizer
    const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
    equalizerNodesRef.current = frequencies.map((freq) => {
      const filter = ctx.createBiquadFilter()
      filter.type = "peaking"
      filter.frequency.value = freq
      filter.Q.value = 1
      filter.gain.value = 0
      return filter
    })

    // Connect nodes: source -> equalizer chain -> panner -> gain -> destination
    let previousNode: AudioNode = sourceNodeRef.current
    equalizerNodesRef.current.forEach((filter) => {
      previousNode.connect(filter)
      previousNode = filter
    })
    previousNode.connect(pannerNodeRef.current!)
    pannerNodeRef.current.connect(gainNodeRef.current)
    gainNodeRef.current.connect(ctx.destination)

    // Audio event listeners
    const audio = audioRef.current
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      handleNext()
    })

    audio.addEventListener("play", () => {
      setIsPlaying(true)
    })

    audio.addEventListener("pause", () => {
      setIsPlaying(false)
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Load track when currentTrack changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    audioRef.current.src = currentTrack.url
    audioRef.current.load()

    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    }
  }, [currentTrack])

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // 8D/16D effect animation
  useEffect(() => {
    if (!effect8DRef.current && !effect16DRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Reset position
      if (pannerNodeRef.current) {
        pannerNodeRef.current.setPosition(0, 0, 0)
      }
      return
    }

    let angle = 0
    const animate = () => {
      if (!pannerNodeRef.current) return

      const radius = effectIntensityRef.current / 50
      const speed = effectSpeedRef.current / 1000

      if (effect8DRef.current) {
        // Simple circular motion for 8D
        angle += speed
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        pannerNodeRef.current.setPosition(x, 0, z)
      } else if (effect16DRef.current) {
        // Complex multi-directional motion for 16D
        angle += speed
        const x = Math.cos(angle) * radius + Math.cos(angle * 2) * (radius * 0.3)
        const y = Math.sin(angle * 1.5) * (radius * 0.5)
        const z = Math.sin(angle) * radius + Math.sin(angle * 3) * (radius * 0.3)
        pannerNodeRef.current.setPosition(x, y, z)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
  }

  const handleNext = () => {
    if (queue.length === 0) {
      onTrackChange(null)
      return
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id)
    const nextIndex = (currentIndex + 1) % queue.length
    onTrackChange(queue[nextIndex])
  }

  const handlePrevious = () => {
    if (!audioRef.current) return

    if (currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    if (queue.length === 0) return

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id)
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1
    onTrackChange(queue[prevIndex])
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-24 bg-card border-t border-border px-6 flex items-center gap-6">
      {/* Track Info */}
      <div className="w-64">
        {currentTrack ? (
          <div className="space-y-1">
            <p className="font-medium text-sm truncate">{currentTrack.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma música tocando</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" onClick={handlePrevious} disabled={!currentTrack}>
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            className="w-10 h-10 bg-accent-vibrant hover:bg-accent-vibrant/90 text-white"
            onClick={togglePlay}
            disabled={!currentTrack}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          <Button size="icon" variant="ghost" onClick={handleNext} disabled={!currentTrack}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-full max-w-2xl flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            className="flex-1"
            onValueChange={handleSeek}
            disabled={!currentTrack}
          />
          <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Settings */}
      <div className="flex items-center gap-4 w-64 justify-end">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsMuted(!isMuted)}>
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
          <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={(value) => setVolume(value[0])} />
        </div>

        <AudioEffectsDialog
          effect8DRef={effect8DRef}
          effect16DRef={effect16DRef}
          intensityRef={effectIntensityRef}
          speedRef={effectSpeedRef}
        />
        <EqualizerDialog equalizerNodes={equalizerNodesRef.current} />
      </div>
    </div>
  )
}
