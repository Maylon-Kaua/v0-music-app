import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "Token de acesso não fornecido" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    const playlistsResponse = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!playlistsResponse.ok) {
      if (playlistsResponse.status === 401) {
        return NextResponse.json({ error: "Token expirado ou inválido" }, { status: 401 })
      }
      return NextResponse.json({ error: "Erro ao buscar playlists" }, { status: playlistsResponse.status })
    }

    const playlistsData = await playlistsResponse.json()
    const playlists = []

    for (const playlist of playlistsData.items) {
      const tracksResponse = await fetch(playlist.tracks.href, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!tracksResponse.ok) continue

      const tracksData = await tracksResponse.json()

      const tracks = tracksData.items
        .filter((item: any) => item.track)
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist: any) => artist.name),
          duration_ms: item.track.duration_ms,
          preview_url: item.track.preview_url,
          album_image: item.track.album.images[0]?.url,
        }))

      playlists.push({
        id: playlist.id,
        name: playlist.name,
        tracks: tracks,
      })
    }

    return NextResponse.json({
      playlists: playlists,
    })
  } catch (error) {
    console.error("Error fetching Spotify playlists:", error)
    return NextResponse.json({ error: "Erro ao processar playlists" }, { status: 500 })
  }
}
