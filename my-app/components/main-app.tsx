"use client"

import { Sidebar } from "@/components/sidebar"
import { AudioPlayer } from "@/components/audio-player"
import { JamSession } from "@/components/jam-session"
import { MusicLibrary } from "@/components/music-library"
import { useState } from "react"

export type Track = {
  id: string
  name: string
  artist: string
  duration: number
  url: string
  coverArt?: string
}

interface MainAppProps {
  user: { id: string; username: string }
  onLogout: () => void
}

export function MainApp({ user, onLogout }: MainAppProps) {
  const [currentView, setCurrentView] = useState<"library" | "jam">("library")
  const [queue, setQueue] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [library, setLibrary] = useState<Track[]>([])

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={onLogout}
        library={library}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {currentView === "library" ? (
            <MusicLibrary
              queue={queue}
              library={library}
              onLibraryChange={setLibrary}
              onAddToQueue={(track) => setQueue([...queue, track])}
              onPlayNow={(track) => {
                setCurrentTrack(track)
                setQueue([track, ...queue.filter((t) => t.id !== track.id)])
              }}
            />
          ) : (
            <JamSession queue={queue} currentTrack={currentTrack} onUpdateQueue={setQueue} user={user} />
          )}
        </div>

        <AudioPlayer
          queue={queue}
          currentTrack={currentTrack}
          onTrackChange={setCurrentTrack}
          onQueueChange={setQueue}
        />
      </main>
    </div>
  )
}
