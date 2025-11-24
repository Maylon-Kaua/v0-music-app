import type { Track, Playlist } from "@/types/music"

export const demoTracks: Track[] = [
  {
    id: "1",
    title: "Chill Vibes",
    artist: "Demo Artist",
    album: "Demo Album",
    duration: 180,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "/music-album-cover-chill.jpg",
  },
  {
    id: "2",
    title: "Electronic Dreams",
    artist: "Synth Master",
    album: "Digital Waves",
    duration: 210,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "/electronic-music-album.png",
  },
  {
    id: "3",
    title: "Acoustic Journey",
    artist: "Guitar Hero",
    album: "Strings of Life",
    duration: 195,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "/acoustic-guitar-album.png",
  },
  {
    id: "4",
    title: "Bass Drop",
    artist: "DJ Beatmaker",
    album: "Heavy Beats",
    duration: 165,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "/edm-music-cover.jpg",
  },
  {
    id: "5",
    title: "Jazz Night",
    artist: "The Smooth Trio",
    album: "Late Night Sessions",
    duration: 240,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverUrl: "/jazz-album-cover.png",
  },
]

export const demoPlaylists: Playlist[] = [
  {
    id: "demo-1",
    name: "Chill Vibes",
    description: "Relaxe e aproveite",
    tracks: [demoTracks[0], demoTracks[2], demoTracks[4]],
    coverUrl: "/chill-playlist-cover.png",
  },
  {
    id: "demo-2",
    name: "Electronic Mix",
    description: "Energia eletrônica",
    tracks: [demoTracks[1], demoTracks[3]],
    coverUrl: "/electronic-playlist.png",
  },
  {
    id: "demo-3",
    name: "Minha Biblioteca",
    description: "Todas as suas músicas",
    tracks: demoTracks,
    coverUrl: "/music-library.png",
  },
]
