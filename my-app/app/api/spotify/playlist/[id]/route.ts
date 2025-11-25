import { type NextRequest, NextResponse } from "next/server"

// Spotify API endpoint para buscar playlists públicas sem autenticação
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const playlistId = params.id

  try {
    // Primeiro, obter um token de acesso usando Client Credentials
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID || "dummy"}:${process.env.SPOTIFY_CLIENT_SECRET || "dummy"}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })

    if (!tokenResponse.ok) {
      // Se não tiver credenciais configuradas, usar API pública (limitada)
      // Retornar erro amigável
      return NextResponse.json(
        {
          error: "Credenciais Spotify não configuradas. Usando modo offline.",
          tracks: [],
        },
        { status: 200 },
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Buscar informações da playlist
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!playlistResponse.ok) {
      return NextResponse.json({ error: "Playlist não encontrada" }, { status: 404 })
    }

    const playlistData = await playlistResponse.json()

    // Extrair informações das músicas
    const tracks = playlistData.tracks.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name),
      duration_ms: item.track.duration_ms,
      preview_url: item.track.preview_url,
      album_image: item.track.album.images[0]?.url,
    }))

    return NextResponse.json({
      name: playlistData.name,
      description: playlistData.description,
      tracks: tracks,
    })
  } catch (error) {
    console.error("[v0] Error fetching Spotify playlist:", error)
    return NextResponse.json({ error: "Erro ao buscar playlist do Spotify" }, { status: 500 })
  }
}
