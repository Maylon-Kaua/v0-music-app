"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, LinkIcon, Plus, Play, Music2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import type { Track } from "./main-app"

interface MusicLibraryProps {
  queue: Track[]
  library: Track[]
  onLibraryChange: (library: Track[]) => void
  onAddToQueue: (track: Track) => void
  onPlayNow: (track: Track) => void
}

export function MusicLibrary({ queue, library, onLibraryChange, onAddToQueue, onPlayNow }: MusicLibraryProps) {
  const [urlInput, setUrlInput] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token")
    if (token) {
      setSpotifyConnected(true)
    }
  }, [])

  const handleConnectSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID

    if (!clientId) {
      toast({
        title: "Configuração necessária",
        description: "Configure as credenciais do Spotify no arquivo .env.local (veja README.md)",
        variant: "destructive",
      })
      return
    }

    const redirectUri = `${window.location.origin}/api/spotify/callback`
    const scopes = "playlist-read-private playlist-read-collaborative user-library-read"
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`

    window.location.href = authUrl
  }

  const handleImportMyPlaylists = async () => {
    setIsLoadingSpotify(true)

    try {
      const token = localStorage.getItem("spotify_access_token")
      if (!token) {
        toast({
          title: "Não conectado",
          description: "Conecte sua conta do Spotify primeiro",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/spotify/my-playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 401) {
          localStorage.removeItem("spotify_access_token")
          setSpotifyConnected(false)
          toast({
            title: "Sessão expirada",
            description: "Reconecte sua conta do Spotify",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Erro ao importar",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      let totalTracks = 0
      const allTracks: Track[] = []

      for (const playlist of data.playlists) {
        const playlistTracks: Track[] = playlist.tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists.join(", "),
          duration: track.duration_ms / 1000,
          url: track.preview_url || "",
          coverArt: track.album_image,
        }))

        const validTracks = playlistTracks.filter((t) => t.url)
        allTracks.push(...validTracks)
        totalTracks += validTracks.length
      }

      onLibraryChange([...library, ...allTracks])

      toast({
        title: "Playlists importadas!",
        description: `${totalTracks} músicas de ${data.playlists.length} playlists adicionadas`,
      })
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar suas playlists",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSpotify(false)
    }
  }

  const handleDisconnectSpotify = () => {
    localStorage.removeItem("spotify_access_token")
    setSpotifyConnected(false)
    toast({
      title: "Desconectado",
      description: "Sua conta do Spotify foi desconectada",
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)

      audio.addEventListener("loadedmetadata", () => {
        const track: Track = {
          id: Math.random().toString(36).substring(7),
          name: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Artista Desconhecido",
          duration: audio.duration,
          url: url,
        }
        onLibraryChange([...library, track])
        toast({
          title: "Música adicionada",
          description: `${track.name} foi adicionada à biblioteca`,
        })
      })
    })
  }

  const handleImportSpotifyPlaylist = async () => {
    if (!urlInput.trim()) return

    const spotifyPlaylistMatch = urlInput.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/)

    if (spotifyPlaylistMatch) {
      setIsImporting(true)
      const playlistId = spotifyPlaylistMatch[1]

      try {
        const response = await fetch(`/api/spotify/playlist/${playlistId}`)
        const data = await response.json()

        if (data.error) {
          toast({
            title: "Erro ao importar",
            description: data.error,
            variant: "destructive",
          })
          return
        }

        const newTracks: Track[] = data.tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists.join(", "),
          duration: track.duration_ms / 1000,
          url: track.preview_url || "",
          coverArt: track.album_image,
        }))

        const validTracks = newTracks.filter((t) => t.url)
        onLibraryChange([...library, ...validTracks])

        toast({
          title: "Playlist importada!",
          description: `${validTracks.length} músicas adicionadas de "${data.name}"`,
        })

        setUrlInput("")
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "Não foi possível importar a playlist do Spotify",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
      }
      return
    }

    const track: Track = {
      id: Math.random().toString(36).substring(7),
      name: "Música da URL",
      artist: "Artista Desconhecido",
      duration: 0,
      url: urlInput,
    }

    onLibraryChange([...library, track])
    toast({
      title: "Música adicionada",
      description: "URL adicionada à biblioteca",
    })
    setUrlInput("")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Biblioteca</h1>
        <p className="text-muted-foreground">Adicione músicas ou importe playlists do Spotify</p>
      </div>

      <Card className="bg-gradient-to-r from-[#1DB954]/10 to-[#1DB954]/5 border-[#1DB954]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-black fill-current">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {spotifyConnected ? "Spotify Conectado" : "Conectar ao Spotify"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {spotifyConnected
                    ? "Importe todas as suas playlists automaticamente"
                    : "Autorize o acesso para importar suas playlists"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {spotifyConnected ? (
                <>
                  <Button
                    onClick={handleImportMyPlaylists}
                    disabled={isLoadingSpotify}
                    className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-black"
                  >
                    {isLoadingSpotify ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Music2 className="w-4 h-4 mr-2" />
                        Importar Minhas Playlists
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDisconnectSpotify}
                    className="border-[#1DB954]/50 bg-transparent"
                  >
                    Desconectar
                  </Button>
                </>
              ) : (
                <Button onClick={handleConnectSpotify} className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-black">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Conectar Spotify
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:border-accent-vibrant/50 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-accent-vibrant/10 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-accent-vibrant" />
            </div>
            <CardTitle>Upload de Arquivos</CardTitle>
            <CardDescription>Arraste arquivos ou clique para selecionar</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              className="w-full bg-accent-vibrant hover:bg-accent-vibrant/90"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-vibrant/50 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-accent-vibrant/10 flex items-center justify-center mb-3">
              <LinkIcon className="w-6 h-6 text-accent-vibrant" />
            </div>
            <CardTitle>Importar do Spotify</CardTitle>
            <CardDescription>Cole o link de uma playlist ou música</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://open.spotify.com/playlist/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImportSpotifyPlaylist()}
                disabled={isImporting}
              />
              <Button
                className="bg-accent-vibrant hover:bg-accent-vibrant/90"
                onClick={handleImportSpotifyPlaylist}
                disabled={isImporting || !urlInput.trim()}
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Importar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Minhas Músicas ({library.length})</h2>

        {library.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music2 className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma música na biblioteca ainda
                <br />
                Adicione músicas ou importe playlists do Spotify
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {library.map((track) => (
                <Card key={track.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {track.coverArt ? (
                        <img
                          src={track.coverArt || "/placeholder.svg"}
                          alt={track.name}
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-accent-vibrant/10 flex items-center justify-center shrink-0">
                          <Music2 className="w-6 h-6 text-accent-vibrant" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => onAddToQueue(track)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Fila
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent-vibrant hover:bg-accent-vibrant/90"
                          onClick={() => onPlayNow(track)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Tocar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
