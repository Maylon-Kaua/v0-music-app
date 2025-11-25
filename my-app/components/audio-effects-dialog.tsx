"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Waves } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AudioEffectsDialogProps {
  effect8DRef: React.MutableRefObject<boolean>
  effect16DRef: React.MutableRefObject<boolean>
  intensityRef: React.MutableRefObject<number>
  speedRef: React.MutableRefObject<number>
}

export function AudioEffectsDialog({ effect8DRef, effect16DRef, intensityRef, speedRef }: AudioEffectsDialogProps) {
  const [effect8D, setEffect8D] = useState(false)
  const [effect16D, setEffect16D] = useState(false)
  const [intensity, setIntensity] = useState(50)
  const [speed, setSpeed] = useState(50)

  useEffect(() => {
    effect8DRef.current = effect8D
    effect16DRef.current = effect16D
    intensityRef.current = intensity
    speedRef.current = speed
  }, [effect8D, effect16D, intensity, speed])

  const toggle8D = (checked: boolean) => {
    setEffect8D(checked)
    if (checked) setEffect16D(false)
  }

  const toggle16D = (checked: boolean) => {
    setEffect16D(checked)
    if (checked) setEffect8D(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Waves className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Efeitos de Áudio Espacial</DialogTitle>
          <DialogDescription>Aplique efeitos espaciais 8D e 16D nas suas músicas</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="8d" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="8d">8D Audio</TabsTrigger>
            <TabsTrigger value="16d">16D Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="8d" className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="8d-toggle" className="text-base">
                  Ativar Efeito 8D
                </Label>
                <p className="text-sm text-muted-foreground">Cria uma sensação de som rotativo ao redor da cabeça</p>
              </div>
              <Switch id="8d-toggle" checked={effect8D} onCheckedChange={toggle8D} />
            </div>

            {effect8D && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Intensidade</Label>
                    <span className="text-sm text-muted-foreground">{intensity}%</span>
                  </div>
                  <Slider
                    value={[intensity]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setIntensity(value[0])}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Velocidade de Rotação</Label>
                    <span className="text-sm text-muted-foreground">{speed}%</span>
                  </div>
                  <Slider value={[speed]} min={0} max={100} step={1} onValueChange={(value) => setSpeed(value[0])} />
                </div>

                <div className="bg-accent-vibrant/5 border border-accent-vibrant/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Dica:</strong> Use fones de ouvido para uma melhor experiência com efeito 8D
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="16d" className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="16d-toggle" className="text-base">
                  Ativar Efeito 16D
                </Label>
                <p className="text-sm text-muted-foreground">
                  Experiência espacial mais intensa com múltiplas direções
                </p>
              </div>
              <Switch id="16d-toggle" checked={effect16D} onCheckedChange={toggle16D} />
            </div>

            {effect16D && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Intensidade</Label>
                    <span className="text-sm text-muted-foreground">{intensity}%</span>
                  </div>
                  <Slider
                    value={[intensity]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setIntensity(value[0])}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Complexidade Espacial</Label>
                    <span className="text-sm text-muted-foreground">{speed}%</span>
                  </div>
                  <Slider value={[speed]} min={0} max={100} step={1} onValueChange={(value) => setSpeed(value[0])} />
                </div>

                <div className="bg-accent-vibrant/5 border border-accent-vibrant/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Dica:</strong> O efeito 16D cria uma experiência mais imersiva com movimentos
                    multidirecionais
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
