"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Playlist, Track } from "@/types/music"
import { demoPlaylists } from "@/lib/demo-music"
import { importSpotifyPlaylistWithOAuth } from "@/lib/spotify-oauth"

interface MusicContextType {
  playlists: Playlist[]
  addPlaylist: (playlist: Playlist) => void
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  uploadTrack: (file: File) => Promise<Track>
  importFromSpotify: (playlistUrl: string) => Promise<void>
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("jamwave_playlists")
    if (stored) {
      setPlaylists(JSON.parse(stored))
    } else {
      setPlaylists(demoPlaylists)
      localStorage.setItem("jamwave_playlists", JSON.stringify(demoPlaylists))
    }
  }, [])

  const addPlaylist = (playlist: Playlist) => {
    const updated = [...playlists, playlist]
    setPlaylists(updated)
    localStorage.setItem("jamwave_playlists", JSON.stringify(updated))
  }

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    const updated = playlists.map((p) => (p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p))
    setPlaylists(updated)
    localStorage.setItem("jamwave_playlists", JSON.stringify(updated))
  }

  const uploadTrack = async (file: File): Promise<Track> => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)

    return new Promise((resolve) => {
      audio.addEventListener("loadedmetadata", () => {
        const track: Track = {
          id: Math.random().toString(36).substring(7),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          duration: audio.duration,
          url,
          coverUrl: "/abstract-music-cover.png",
        }
        resolve(track)
      })
    })
  }

  const importFromSpotify = async (playlistUrl: string) => {
    const spotifyData = await importSpotifyPlaylistWithOAuth(playlistUrl)

    const playlist: Playlist = {
      id: `spotify-${Date.now()}`,
      name: spotifyData.name,
      description: spotifyData.description,
      coverUrl: spotifyData.coverUrl,
      tracks: spotifyData.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        url: track.previewUrl || "",
        coverUrl: track.coverUrl,
      })),
    }

    addPlaylist(playlist)
  }

  return (
    <MusicContext.Provider value={{ playlists, addPlaylist, addTrackToPlaylist, uploadTrack, importFromSpotify }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error("useMusic must be used within MusicProvider")
  }
  return context
}
