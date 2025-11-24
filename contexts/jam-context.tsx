"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

interface Track {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  imageUrl: string
  previewUrl: string | null
  addedBy: string
  addedByName: string
}

interface JamSession {
  id: string
  name: string
  code: string
  host: string
  hostName: string
  members: Member[]
  queue: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  createdAt: number
}

interface Member {
  id: string
  name: string
  avatar?: string
  isHost: boolean
}

interface JamContextType {
  currentSession: JamSession | null
  createSession: (name: string) => void
  joinSession: (code: string) => void
  leaveSession: () => void
  addToQueue: (track: Track) => void
  removeFromQueue: (trackId: string) => void
  playNext: () => void
  playPrevious: () => void
  togglePlayPause: () => void
}

const JamContext = createContext<JamContextType | undefined>(undefined)

export function JamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<JamSession | null>(null)

  // Load session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("jam_session")
    if (savedSession) {
      try {
        setCurrentSession(JSON.parse(savedSession))
      } catch {
        localStorage.removeItem("jam_session")
      }
    }
  }, [])

  // Save session to localStorage
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem("jam_session", JSON.stringify(currentSession))
    } else {
      localStorage.removeItem("jam_session")
    }
  }, [currentSession])

  const createSession = (name: string) => {
    if (!user) return

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const newSession: JamSession = {
      id: Date.now().toString(),
      name,
      code,
      host: user.id,
      hostName: user.display_name,
      members: [
        {
          id: user.id,
          name: user.display_name,
          avatar: user.images?.[0]?.url,
          isHost: true,
        },
      ],
      queue: [],
      currentTrackIndex: -1,
      isPlaying: false,
      createdAt: Date.now(),
    }

    setCurrentSession(newSession)
  }

  const joinSession = (code: string) => {
    if (!user) return

    // In a real app, this would fetch the session from a backend
    // For now, we'll simulate joining by checking localStorage or creating a mock
    const existingSession = localStorage.getItem(`jam_session_${code}`)

    if (existingSession) {
      try {
        const session = JSON.parse(existingSession)

        // Add current user as member
        const updatedSession = {
          ...session,
          members: [
            ...session.members,
            {
              id: user.id,
              name: user.display_name,
              avatar: user.images?.[0]?.url,
              isHost: false,
            },
          ],
        }

        setCurrentSession(updatedSession)
      } catch {
        console.error("Invalid session code")
      }
    }
  }

  const leaveSession = () => {
    setCurrentSession(null)
  }

  const addToQueue = (track: Track) => {
    if (!currentSession || !user) return

    const trackWithUser = {
      ...track,
      addedBy: user.id,
      addedByName: user.display_name,
    }

    setCurrentSession({
      ...currentSession,
      queue: [...currentSession.queue, trackWithUser],
    })
  }

  const removeFromQueue = (trackId: string) => {
    if (!currentSession) return

    setCurrentSession({
      ...currentSession,
      queue: currentSession.queue.filter((t) => t.id !== trackId),
    })
  }

  const playNext = () => {
    if (!currentSession) return

    const nextIndex = currentSession.currentTrackIndex + 1
    if (nextIndex < currentSession.queue.length) {
      setCurrentSession({
        ...currentSession,
        currentTrackIndex: nextIndex,
        isPlaying: true,
      })
    }
  }

  const playPrevious = () => {
    if (!currentSession) return

    const prevIndex = currentSession.currentTrackIndex - 1
    if (prevIndex >= 0) {
      setCurrentSession({
        ...currentSession,
        currentTrackIndex: prevIndex,
        isPlaying: true,
      })
    }
  }

  const togglePlayPause = () => {
    if (!currentSession) return

    setCurrentSession({
      ...currentSession,
      isPlaying: !currentSession.isPlaying,
    })
  }

  return (
    <JamContext.Provider
      value={{
        currentSession,
        createSession,
        joinSession,
        leaveSession,
        addToQueue,
        removeFromQueue,
        playNext,
        playPrevious,
        togglePlayPause,
      }}
    >
      {children}
    </JamContext.Provider>
  )
}

export function useJam() {
  const context = useContext(JamContext)
  if (context === undefined) {
    throw new Error("useJam must be used within a JamProvider")
  }
  return context
}
