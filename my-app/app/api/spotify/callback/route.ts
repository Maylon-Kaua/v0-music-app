import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/?error=spotify_auth_failed", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/?error=missing_credentials", request.url))
    }

    const redirectUri = `${request.nextUrl.origin}/api/spotify/callback`

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.redirect(new URL(`/?error=${tokenData.error}`, request.url))
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Conectado</title>
        </head>
        <body>
          <script>
            localStorage.setItem('spotify_access_token', '${tokenData.access_token}');
            localStorage.setItem('spotify_refresh_token', '${tokenData.refresh_token}');
            localStorage.setItem('spotify_token_expiry', '${Date.now() + tokenData.expires_in * 1000}');
            window.location.href = '/';
          </script>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error in Spotify callback:", error)
    return NextResponse.redirect(new URL("/?error=callback_failed", request.url))
  }
}
