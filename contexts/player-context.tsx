"use client"

import type React from "react"

import { createContext, useContext, useRef, useState, useEffect } from "react"
import { AudioEngine } from "@/lib/audio-engine"

interface Track {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  imageUrl: string
  previewUrl: string | null
}

interface PlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  effect8D: number
  effect16D: number
  playTrack: (track: Track) => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  set8DEffect: (intensity: number) => void
  set16DEffect: (intensity: number) => void
  audioEngine: AudioEngine | null
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioEngineRef = useRef<AudioEngine | null>(null)

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const [effect8D, setEffect8DState] = useState(0)
  const [effect16D, setEffect16DState] = useState(0)

  useEffect(() => {
    // Create audio element
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audioRef.current = audio

    // Initialize audio engine
    audioEngineRef.current = new AudioEngine()
    audioEngineRef.current.initialize(audio)
    audioEngineRef.current.setVolume(volume)

    // Event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handlePlay = () => {
      audioEngineRef.current?.resume()
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audioEngineRef.current?.destroy()
    }
  }, [])

  const playTrack = (track: Track) => {
    if (!audioRef.current || !track.previewUrl) return

    audioRef.current.src = track.previewUrl
    audioRef.current.play()
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const seek = (time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const setVolume = (vol: number) => {
    setVolumeState(vol)
    audioEngineRef.current?.setVolume(vol)
  }

  const set8DEffect = (intensity: number) => {
    setEffect8DState(intensity)
    audioEngineRef.current?.set8DEffect(intensity)
  }

  const set16DEffect = (intensity: number) => {
    setEffect16DState(intensity)
    audioEngineRef.current?.set16DEffect(intensity)
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        effect8D,
        effect16D,
        playTrack,
        togglePlay,
        seek,
        setVolume,
        set8DEffect,
        set16DEffect,
        audioEngine: audioEngineRef.current,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
