"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("Spotify auth error:", error)
      router.push("/")
      return
    }

    if (code) {
      // Exchange code for token
      fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("spotify_access_token", data.access_token)
            localStorage.setItem("spotify_refresh_token", data.refresh_token)
            router.push("/app")
          } else {
            router.push("/")
          }
        })
        .catch((err) => {
          console.error("Token exchange error:", err)
          router.push("/")
        })
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner className="mx-auto" />
        <p className="text-muted-foreground">Conectando com Spotify...</p>
      </div>
    </div>
  )
}
