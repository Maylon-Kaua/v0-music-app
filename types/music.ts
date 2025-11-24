export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  url: string
  coverUrl?: string
  addedBy?: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: Track[]
  coverUrl?: string
}
