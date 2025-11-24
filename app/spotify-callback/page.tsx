"use client"

import { useEffect } from "react"

export default function SpotifyCallbackPage() {
  useEffect(() => {
    // Extract token from URL hash
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const access_token = params.get("access_token")
    const expires_in = params.get("expires_in")

    if (access_token && expires_in) {
      // Send message to parent window
      window.opener?.postMessage(
        {
          type: "spotify-auth",
          access_token,
          expires_in: Number.parseInt(expires_in),
        },
        window.location.origin,
      )

      // Close popup
      window.close()
    } else {
      // Error or cancelled
      window.opener?.postMessage(
        {
          type: "spotify-auth",
          access_token: null,
        },
        window.location.origin,
      )
      window.close()
    }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block size-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <p className="text-lg">Conectando com Spotify...</p>
      </div>
    </div>
  )
}
