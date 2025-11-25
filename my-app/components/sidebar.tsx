"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Music2, Library, Radio, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Track } from "./main-app"

interface SidebarProps {
  currentView: "library" | "jam"
  onViewChange: (view: "library" | "jam") => void
  user: { id: string; username: string }
  onLogout: () => void
  library: Track[]
}

export function Sidebar({ currentView, onViewChange, user, onLogout, library }: SidebarProps) {
  const router = useRouter()
  const [playlists, setPlaylists] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token")
    if (!token) return

    // Fetch user playlists
    fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setPlaylists(data.items)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-vibrant/10 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-accent-vibrant" />
          </div>
          <h1 className="text-xl font-bold">SoundSpace</h1>
        </div>

        <div className="flex items-center justify-between bg-accent/30 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent-vibrant text-white text-xs">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{library.length} músicas</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLogout} title="Sair">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <Button
          variant={currentView === "library" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => onViewChange("library")}
        >
          <Library className="w-5 h-5" />
          Minha Biblioteca
        </Button>
        <Button
          variant={currentView === "jam" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => onViewChange("jam")}
        >
          <Radio className="w-5 h-5" />
          Jam Session
        </Button>
      </nav>

      <div className="flex-1 overflow-hidden flex flex-col px-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Playlists Recentes</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-4">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                {playlist.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="bg-accent-vibrant/5 border border-accent-vibrant/20 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Sistema 100% Local</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sem necessidade de contas ou APIs externas. Suas músicas, suas regras.
          </p>
        </div>
      </div>
    </aside>
  )
}
