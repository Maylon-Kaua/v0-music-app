const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ""
const SPOTIFY_REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
  (typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback` : "")

const SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ")

export function getSpotifyAuthUrl() {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "token",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    show_dialog: "true",
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export function getAccessTokenFromUrl() {
  if (typeof window === "undefined") return null

  const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce((acc: Record<string, string>, item) => {
      const parts = item.split("=")
      acc[parts[0]] = decodeURIComponent(parts[1])
      return acc
    }, {})

  return hash.access_token
}

export async function fetchUserPlaylists(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) throw new Error("Failed to fetch playlists")
  return response.json()
}

export async function fetchPlaylistTracks(accessToken: string, playlistId: string) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) throw new Error("Failed to fetch tracks")
  return response.json()
}

export async function fetchUserProfile(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) throw new Error("Failed to fetch user profile")
  return response.json()
}
