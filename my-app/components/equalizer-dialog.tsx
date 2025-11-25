"use client"

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

const presets = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rock: [4, 3, -1, -2, -1, 1, 3, 4, 4, 4],
  pop: [-1, -1, 0, 2, 4, 4, 2, 0, -1, -1],
  jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  classical: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4],
  bassBoost: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  vocal: [-2, -3, -2, 1, 3, 3, 2, 1, 0, -1],
}

interface EqualizerDialogProps {
  equalizerNodes: BiquadFilterNode[]
}

export function EqualizerDialog({ equalizerNodes }: EqualizerDialogProps) {
  const frequencies = [
    { label: "32Hz", value: 32 },
    { label: "64Hz", value: 64 },
    { label: "125Hz", value: 125 },
    { label: "250Hz", value: 250 },
    { label: "500Hz", value: 500 },
    { label: "1kHz", value: 1000 },
    { label: "2kHz", value: 2000 },
    { label: "4kHz", value: 4000 },
    { label: "8kHz", value: 8000 },
    { label: "16kHz", value: 16000 },
  ]

  const [bands, setBands] = useState<number[]>(new Array(10).fill(0))

  const updateBand = (index: number, value: number) => {
    const newBands = [...bands]
    newBands[index] = value
    setBands(newBands)

    // Update actual audio filter
    if (equalizerNodes[index]) {
      equalizerNodes[index].gain.value = value
    }
  }

  const applyPreset = (preset: number[]) => {
    setBands(preset)
    preset.forEach((value, index) => {
      if (equalizerNodes[index]) {
        equalizerNodes[index].gain.value = value
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Equalizador de 10 Bandas</DialogTitle>
          <DialogDescription>Ajuste as frequências para personalizar seu som</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex gap-4 items-end justify-center h-64">
            {bands.map((value, index) => (
              <div key={frequencies[index].label} className="flex flex-col items-center gap-3 flex-1">
                <Slider
                  orientation="vertical"
                  value={[value]}
                  min={-12}
                  max={12}
                  step={0.5}
                  className="h-full"
                  onValueChange={(val) => updateBand(index, val[0])}
                />
                <div className="text-center">
                  <div className="text-xs font-medium">{frequencies[index].label}</div>
                  <div className="text-xs text-muted-foreground">
                    {value > 0 ? "+" : ""}
                    {value.toFixed(1)}dB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => applyPreset(presets.flat)}>
            Resetar
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => applyPreset(presets.rock)}>
              Rock
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset(presets.pop)}>
              Pop
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset(presets.jazz)}>
              Jazz
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset(presets.classical)}>
              Classical
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset(presets.bassBoost)}>
              Bass Boost
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset(presets.vocal)}>
              Vocal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
