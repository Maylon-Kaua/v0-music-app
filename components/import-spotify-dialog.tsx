"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMusic } from "@/contexts/music-context"
import { importSpotifyPlaylistWithOAuth } from "@/lib/spotify-oauth"
import type { Playlist } from "@/types/music"

export function ImportSpotifyDialog() {
  const [open, setOpen] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { addPlaylist } = useMusic()

  const handleImport = async () => {
    if (!playlistUrl.trim()) {
      toast({
        title: "URL necessária",
        description: "Por favor, cole o link da playlist do Spotify",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const spotifyData = await importSpotifyPlaylistWithOAuth(playlistUrl)

      const playlist: Playlist = {
        id: `spotify-${Date.now()}`,
        name: spotifyData.name,
        description: spotifyData.description,
        coverUrl: spotifyData.coverUrl,
        tracks: spotifyData.tracks.map((track: any) => ({
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

      toast({
        title: "Playlist importada!",
        description: `${playlist.name} foi adicionada à sua biblioteca com ${playlist.tracks.length} músicas`,
      })

      setPlaylistUrl("")
      setOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Verifique o link e tente novamente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="size-4" />
          Importar do Spotify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Playlist do Spotify</DialogTitle>
          <DialogDescription>
            Cole o link de uma playlist do Spotify. Você será solicitado a fazer login no Spotify se necessário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-url">Link da Playlist</Label>
            <Input
              id="playlist-url"
              placeholder="https://open.spotify.com/playlist/..."
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={loading} className="gap-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Importar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
