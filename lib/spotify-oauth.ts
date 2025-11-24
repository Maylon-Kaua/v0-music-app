// Client-side Spotify OAuth authentication
export class SpotifyOAuth {
  private static instance: SpotifyOAuth
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  private constructor() {
    // Load token from sessionStorage if available
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("spotify_token")
      const expiry = sessionStorage.getItem("spotify_token_expiry")
      if (stored && expiry && Date.now() < Number.parseInt(expiry)) {
        this.accessToken = stored
        this.tokenExpiry = Number.parseInt(expiry)
      }
    }
  }

  static getInstance(): SpotifyOAuth {
    if (!SpotifyOAuth.instance) {
      SpotifyOAuth.instance = new SpotifyOAuth()
    }
    return SpotifyOAuth.instance
  }

  private static getClientId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("spotify_client_id")
  }

  static isConfigured(): boolean {
    return !!this.getClientId()
  }

  // Check if we have a valid token
  hasValidToken(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry)
  }

  // Initiate Spotify login (opens popup)
  async login(): Promise<boolean> {
    return new Promise((resolve) => {
      const clientId = SpotifyOAuth.getClientId()

      if (!clientId) {
        console.error("Spotify Client ID not configured")
        resolve(false)
        return
      }

      const redirectUri = window.location.origin + "/spotify-callback"
      const scope = "playlist-read-private playlist-read-collaborative user-read-email user-read-private"

      const authUrl =
        `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=token&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}`

      // Open in popup
      const width = 500
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(authUrl, "Spotify Login", `width=${width},height=${height},left=${left},top=${top}`)

      // Listen for callback
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === "spotify-auth") {
          const { access_token, expires_in } = event.data
          if (access_token) {
            this.accessToken = access_token
            this.tokenExpiry = Date.now() + expires_in * 1000

            // Store in sessionStorage
            sessionStorage.setItem("spotify_token", access_token)
            sessionStorage.setItem("spotify_token_expiry", this.tokenExpiry.toString())

            window.removeEventListener("message", handleMessage)
            resolve(true)
          } else {
            resolve(false)
          }
        }
      }

      window.addEventListener("message", handleMessage)

      // Check if popup was blocked or closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", handleMessage)
          resolve(false)
        }
      }, 500)
    })
  }

  // Get current access token
  getToken(): string | null {
    if (this.hasValidToken()) {
      return this.accessToken
    }
    return null
  }

  // Logout
  logout() {
    this.accessToken = null
    this.tokenExpiry = null
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("spotify_token")
      sessionStorage.removeItem("spotify_token_expiry")
    }
  }

  async getUserProfile(): Promise<{ id: string; displayName: string; email: string; imageUrl?: string } | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.logout()
        }
        return null
      }

      const data = await response.json()
      return {
        id: data.id,
        displayName: data.display_name || data.id,
        email: data.email,
        imageUrl: data.images?.[0]?.url,
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  async getUserPlaylists(): Promise<any[]> {
    const token = this.getToken()
    if (!token) return []

    try {
      const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.logout()
        }
        return []
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error("Error fetching playlists:", error)
      return []
    }
  }
}

// Function to import playlist using OAuth token
export async function importSpotifyPlaylistWithOAuth(playlistUrl: string): Promise<any> {
  const oauth = SpotifyOAuth.getInstance()

  // Check if we need to login
  if (!oauth.hasValidToken()) {
    const success = await oauth.login()
    if (!success) {
      throw new Error("Falha ao conectar com o Spotify")
    }
  }

  const token = oauth.getToken()
  if (!token) {
    throw new Error("Token de acesso não disponível")
  }

  // Extract playlist ID
  const playlistId = extractPlaylistId(playlistUrl)
  if (!playlistId) {
    throw new Error("URL de playlist inválida")
  }

  // Fetch playlist from Spotify API
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, clear it and retry
      oauth.logout()
      throw new Error("Sessão expirada. Por favor, tente novamente.")
    }
    throw new Error("Não foi possível buscar a playlist")
  }

  const playlistData = await response.json()

  return {
    name: playlistData.name,
    description: playlistData.description || "",
    coverUrl: playlistData.images?.[0]?.url || "/placeholder.svg",
    tracks: playlistData.tracks.items
      .filter((item: any) => item.track)
      .map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(", "),
        album: item.track.album.name,
        duration: item.track.duration_ms / 1000,
        coverUrl: item.track.album.images?.[0]?.url || "/placeholder.svg",
        previewUrl: item.track.preview_url,
      })),
  }
}

function extractPlaylistId(url: string): string | null {
  const patterns = [/spotify\.com\/playlist\/([a-zA-Z0-9]+)/, /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}
