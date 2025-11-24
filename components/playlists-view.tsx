"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { Music, Play, Plus, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { usePlayer } from "@/contexts/player-context"
import { useJam } from "@/contexts/jam-context"
import { useMusic } from "@/contexts/music-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Track } from "@/types/music"
import { ImportSpotifyDialog } from "@/components/import-spotify-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpotifyPlaylistsList } from "@/components/spotify-playlists-list"

export function PlaylistsView() {
  const { playTrack } = usePlayer()
  const { currentSession, addToQueue } = useJam()
  const { playlists, uploadTrack, addTrackToPlaylist } = useMusic()
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo de áudio",
        variant: "destructive",
      })
      return
    }

    try {
      const track = await uploadTrack(file)
      if (selectedPlaylist) {
        addTrackToPlaylist(selectedPlaylist, track)
      } else {
        addTrackToPlaylist("demo-3", track)
      }
      toast({
        title: "Música adicionada!",
        description: `${track.title} foi adicionada à biblioteca`,
      })
    } catch (error) {
      toast({
        title: "Erro ao adicionar música",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track.id,
      name: track.title,
      artist: track.artist,
      album: track.album || "Unknown Album",
      duration: track.duration,
      imageUrl: track.coverUrl || "/placeholder.svg?key=u0wzf",
      previewUrl: track.url,
    })
  }

  const handleAddToJam = (track: Track) => {
    addToQueue({
      id: track.id,
      name: track.title,
      artist: track.artist,
      album: track.album || "Unknown Album",
      duration: track.duration,
      imageUrl: track.coverUrl || "/placeholder.svg?key=u0wzf",
      previewUrl: track.url,
      addedBy: user?.id || "",
      addedByName: user?.displayName || "Unknown",
    })

    toast({
      title: "Adicionada à fila!",
      description: `${track.title} foi adicionada ao jam session`,
    })
  }

  const selectedPlaylistData = playlists.find((p) => p.id === selectedPlaylist)

  return (
    <div className="p-6 md:p-8">
      {!selectedPlaylist ? (
        <>
          <Tabs defaultValue="library" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Playlists</h2>
                <TabsList>
                  <TabsTrigger value="library">Minha Biblioteca</TabsTrigger>
                  <TabsTrigger value="spotify">Do Spotify</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex items-center gap-2">
                <ImportSpotifyDialog />
                <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="size-4" />
                  Upload Música
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload music file"
              />
            </div>

            <TabsContent value="library">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    className="group cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-muted">
                        {playlist.coverUrl ? (
                          <img
                            src={playlist.coverUrl || "/placeholder.svg"}
                            alt={playlist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="size-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Button
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all size-12 rounded-full"
                          >
                            <Play className="size-6 fill-current" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground">{playlist.tracks.length} músicas</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="spotify">
              <SpotifyPlaylistsList />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => setSelectedPlaylist(null)}>
                ← Voltar
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
                <Upload className="size-4" />
                Adicionar Música
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload music file"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedPlaylistData?.name}</h2>
            <p className="text-muted-foreground">{selectedPlaylistData?.tracks.length} músicas</p>
          </div>

          <div className="space-y-2">
            {selectedPlaylistData?.tracks.map((track, index) => (
              <Card key={track.id + index} className="group hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded bg-muted overflow-hidden flex-shrink-0">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl || "/placeholder.svg"}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentSession && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAddToJam(track)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Adicionar ao Jam Session"
                        >
                          <Plus className="size-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePlayTrack(track)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Tocar agora"
                      >
                        <Play className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
