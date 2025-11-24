"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Loader2, Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useMusic } from "@/contexts/music-context"
import { useToast } from "@/hooks/use-toast"
import type { Playlist } from "@/types/music"

interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: { total: number }
  owner: { display_name: string }
}

export function SpotifyPlaylistsList() {
  const { spotifyAuth } = useAuth()
  const { addPlaylist } = useMusic()
  const { toast } = useToast()
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)

  useEffect(() => {
    loadSpotifyPlaylists()
  }, [])

  const loadSpotifyPlaylists = async () => {
    try {
      const playlists = await spotifyAuth.getUserPlaylists()
      setSpotifyPlaylists(playlists)
    } catch (error) {
      console.error("Error loading Spotify playlists:", error)
    } finally {
      setLoading(false)
    }
  }

  const importPlaylist = async (spotifyPlaylist: SpotifyPlaylist) => {
    setImportingId(spotifyPlaylist.id)
    try {
      const token = spotifyAuth.getToken()
      if (!token) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente",
          variant: "destructive",
        })
        return
      }

      // Fetch full playlist details with tracks
      const response = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylist.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao buscar playlist")
      }

      const data = await response.json()

      const playlist: Playlist = {
        id: `spotify-${spotifyPlaylist.id}`,
        name: data.name,
        description: data.description || "",
        coverUrl: data.images?.[0]?.url || "/placeholder.svg",
        tracks: data.tracks.items
          .filter((item: any) => item.track)
          .map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists.map((a: any) => a.name).join(", "),
            album: item.track.album.name,
            duration: item.track.duration_ms / 1000,
            url: item.track.preview_url || "",
            coverUrl: item.track.album.images?.[0]?.url || "/placeholder.svg",
          })),
      }

      addPlaylist(playlist)

      toast({
        title: "Playlist importada!",
        description: `${playlist.name} foi adicionada à sua biblioteca`,
      })
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setImportingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (spotifyPlaylists.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="size-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma playlist encontrada no seu Spotify</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {spotifyPlaylists.map((playlist) => (
        <Card key={playlist.id} className="group overflow-hidden hover:bg-accent/50 transition-colors">
          <CardContent className="p-0">
            <div className="aspect-square relative bg-muted">
              {playlist.images?.[0]?.url ? (
                <img
                  src={playlist.images[0].url || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="size-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <Button
                  size="icon"
                  onClick={() => importPlaylist(playlist)}
                  disabled={importingId === playlist.id}
                  className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all size-12 rounded-full"
                >
                  {importingId === playlist.id ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <Download className="size-6" />
                  )}
                </Button>
              </div>
            </div>
            <div className="p-3 space-y-1">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{playlist.name}</h3>
              <p className="text-xs text-muted-foreground">{playlist.tracks.total} músicas</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
