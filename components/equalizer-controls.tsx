"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, Zap } from "lucide-react"
import { usePlayer } from "@/contexts/player-context"

const EQ_PRESETS = {
  flat: { name: "Flat", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  bass: { name: "Bass Boost", values: [8, 6, 4, 2, 0, -2, -2, -2, -2, -2] },
  treble: { name: "Treble Boost", values: [-2, -2, -2, -2, 0, 2, 4, 6, 8, 8] },
  vocal: { name: "Vocal", values: [-2, -2, -2, 2, 4, 4, 4, 2, 0, -2] },
  rock: { name: "Rock", values: [6, 4, 2, -2, -2, 0, 2, 4, 6, 6] },
  electronic: { name: "Electronic", values: [6, 4, 2, 0, -2, 0, 2, 4, 6, 8] },
  jazz: { name: "Jazz", values: [4, 2, 0, 2, -2, -2, 0, 2, 4, 4] },
  classical: { name: "Classical", values: [4, 2, 0, 0, -2, -2, 0, 2, 4, 4] },
}

export function EqualizerControls() {
  const { audioEngine } = usePlayer()
  const [eqValues, setEqValues] = useState<number[]>(Array(10).fill(0))
  const [selectedPreset, setSelectedPreset] = useState<string>("flat")

  const bands = audioEngine?.getEQBands() || [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]

  const handleBandChange = (index: number, value: number) => {
    const newValues = [...eqValues]
    newValues[index] = value
    setEqValues(newValues)
    audioEngine?.setEQBand(index, value)
    setSelectedPreset("custom")
  }

  const applyPreset = (presetKey: string) => {
    const preset = EQ_PRESETS[presetKey as keyof typeof EQ_PRESETS]
    if (!preset) return

    setEqValues(preset.values)
    setSelectedPreset(presetKey)
    preset.values.forEach((value, index) => {
      audioEngine?.setEQBand(index, value)
    })
  }

  const reset = () => {
    applyPreset("flat")
  }

  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(freq >= 10000 ? 0 : 1)}k`
    }
    return freq.toString()
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Presets</h3>
            <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-2">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(EQ_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={selectedPreset === key ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset(key)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Equalizer Bands */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            <h3 className="font-semibold">Equalizador de 10 Bandas</h3>
          </div>

          <div className="flex items-end gap-3 h-64">
            {bands.map((freq, index) => (
              <div key={freq} className="flex-1 flex flex-col items-center gap-3 h-full">
                {/* Slider */}
                <div className="flex-1 flex items-center justify-center w-full">
                  <Slider
                    orientation="vertical"
                    value={[eqValues[index]]}
                    min={-12}
                    max={12}
                    step={0.5}
                    onValueChange={([value]) => handleBandChange(index, value)}
                    className="h-full"
                  />
                </div>

                {/* Value Display */}
                <div className="text-xs font-medium text-center min-w-[2rem]">
                  {eqValues[index] > 0 ? "+" : ""}
                  {eqValues[index].toFixed(1)}
                </div>

                {/* Frequency Label */}
                <div className="text-[10px] text-muted-foreground text-center font-mono">{formatFrequency(freq)}Hz</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>-12dB</span>
            <span>0dB</span>
            <span>+12dB</span>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-4 bg-muted/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ajuste as frequências para personalizar o som. Bandas baixas (60-600Hz) controlam graves, médias (1-6kHz)
          controlam vocais e instrumentos, e altas (12-16kHz) controlam agudos e detalhes.
        </p>
      </Card>
    </div>
  )
}
