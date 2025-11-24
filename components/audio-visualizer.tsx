"use client"

import { useEffect, useRef } from "react"
import { usePlayer } from "@/contexts/player-context"
import { Card } from "@/components/ui/card"

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { audioEngine, isPlaying } = usePlayer()
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioEngine) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const dataArray = audioEngine.getAnalyserData()
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.fillStyle = "rgb(10, 10, 10)"
      ctx.fillRect(0, 0, width, height)

      // Draw bars
      const barCount = 64
      const barWidth = width / barCount
      const step = Math.floor(dataArray.length / barCount)

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0
        const barHeight = (value / 255) * height
        const x = i * barWidth
        const y = height - barHeight

        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, height)
        gradient.addColorStop(0, "hsl(142, 60%, 50%)")
        gradient.addColorStop(0.5, "hsl(142, 50%, 40%)")
        gradient.addColorStop(1, "hsl(142, 40%, 30%)")

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth - 1, barHeight)
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isPlaying) {
      draw()
    } else {
      // Draw static state
      const width = canvas.width
      const height = canvas.height
      ctx.fillStyle = "rgb(10, 10, 10)"
      ctx.fillRect(0, 0, width, height)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioEngine, isPlaying])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur">
      <canvas ref={canvasRef} className="w-full h-32" style={{ display: "block" }} />
    </Card>
  )
}
