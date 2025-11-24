"use client"

import { useState } from "react"
import { Music2, ListMusic, Radio, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { PlaylistsView } from "@/components/playlists-view"
import { AudioPlayer } from "@/components/audio-player"
import { EqualizerControls } from "@/components/equalizer-controls"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { JamSessionView } from "@/components/jam-session-view"

export function AppShell() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"playlists" | "jam" | "settings">("playlists")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
              <Music2 className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">JamWave</h1>
              <p className="text-xs text-muted-foreground">Spatial Music Experience</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="size-5" />
            </Button>
            <Avatar className="size-10">
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 px-4 pb-4">
          <Button
            variant={activeTab === "playlists" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("playlists")}
            className="gap-2"
          >
            <ListMusic className="size-4" />
            Playlists
          </Button>
          <Button
            variant={activeTab === "jam" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("jam")}
            className="gap-2"
          >
            <Radio className="size-4" />
            Jam Session
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("settings")}
            className="gap-2"
          >
            <Settings className="size-4" />
            Equalizador
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-6">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6 p-6">
          {/* Left: Main View */}
          <div className="min-w-0">
            {activeTab === "playlists" && <PlaylistsView />}
            {activeTab === "jam" && <JamSessionView />}
            {activeTab === "settings" && <EqualizerControls />}
          </div>

          {/* Right: Audio Player & Visualizer */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">
            <AudioVisualizer />
            <AudioPlayer />
          </div>
        </div>
      </main>
    </div>
  )
}
