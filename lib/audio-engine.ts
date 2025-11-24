export class AudioEngine {
  private audioContext: AudioContext | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private pannerNode: StereoPannerNode | null = null
  private analyserNode: AnalyserNode | null = null
  private audioElement: HTMLAudioElement | null = null

  // 8D/16D effect parameters
  private oscillator8D: OscillatorNode | null = null
  private oscillator16D: OscillatorNode | null = null
  private effect8DGain: GainNode | null = null
  private effect16DGain: GainNode | null = null

  // Equalizer bands
  private eqFilters: BiquadFilterNode[] = []
  private eqBands = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]

  initialize(audioElement: HTMLAudioElement) {
    if (this.audioContext) return

    this.audioElement = audioElement
    this.audioContext = new AudioContext()

    // Create audio nodes
    this.sourceNode = this.audioContext.createMediaElementSource(audioElement)
    this.gainNode = this.audioContext.createGain()
    this.pannerNode = this.audioContext.createStereoPanner()
    this.analyserNode = this.audioContext.createAnalyser()

    // Setup 8D effect
    this.effect8DGain = this.audioContext.createGain()
    this.effect8DGain.gain.value = 0

    this.oscillator8D = this.audioContext.createOscillator()
    this.oscillator8D.frequency.value = 0.2 // Slow rotation for 8D
    this.oscillator8D.connect(this.effect8DGain)
    this.oscillator8D.start()

    // Setup 16D effect (faster rotation)
    this.effect16DGain = this.audioContext.createGain()
    this.effect16DGain.gain.value = 0

    this.oscillator16D = this.audioContext.createOscillator()
    this.oscillator16D.frequency.value = 0.4 // Faster rotation for 16D
    this.oscillator16D.connect(this.effect16DGain)
    this.oscillator16D.start()

    // Create equalizer
    this.createEqualizer()

    // Connect audio graph
    this.connectNodes()

    // Setup analyser
    this.analyserNode.fftSize = 256
  }

  private createEqualizer() {
    if (!this.audioContext) return

    this.eqFilters = this.eqBands.map((frequency, index) => {
      const filter = this.audioContext!.createBiquadFilter()

      if (index === 0) {
        filter.type = "lowshelf"
      } else if (index === this.eqBands.length - 1) {
        filter.type = "highshelf"
      } else {
        filter.type = "peaking"
        filter.Q.value = 1
      }

      filter.frequency.value = frequency
      filter.gain.value = 0

      return filter
    })
  }

  private connectNodes() {
    if (!this.sourceNode || !this.audioContext) return

    let currentNode: AudioNode = this.sourceNode

    // Connect equalizer chain
    this.eqFilters.forEach((filter) => {
      currentNode.connect(filter)
      currentNode = filter
    })

    // Connect spatial effects
    currentNode.connect(this.pannerNode!)

    // Connect 8D effect to panner
    this.effect8DGain!.connect(this.pannerNode!.pan)

    // Connect 16D effect to panner (doubled intensity)
    this.effect16DGain!.connect(this.pannerNode!.pan)

    // Connect to gain and output
    this.pannerNode!.connect(this.gainNode!)
    this.gainNode!.connect(this.analyserNode!)
    this.analyserNode!.connect(this.audioContext.destination)
  }

  set8DEffect(intensity: number) {
    if (!this.effect8DGain) return
    // Intensity from 0 to 1
    this.effect8DGain.gain.value = intensity
  }

  set16DEffect(intensity: number) {
    if (!this.effect16DGain) return
    // Intensity from 0 to 1, doubled for more dramatic effect
    this.effect16DGain.gain.value = intensity * 2
  }

  setVolume(volume: number) {
    if (!this.gainNode) return
    this.gainNode.gain.value = volume
  }

  setEQBand(bandIndex: number, gain: number) {
    if (!this.eqFilters[bandIndex]) return
    // Gain in dB, range -12 to +12
    this.eqFilters[bandIndex].gain.value = gain
  }

  getEQBands() {
    return this.eqBands
  }

  getAnalyserData() {
    if (!this.analyserNode) return new Uint8Array(0)
    const bufferLength = this.analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyserNode.getByteFrequencyData(dataArray)
    return dataArray
  }

  resume() {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume()
    }
  }

  destroy() {
    this.oscillator8D?.stop()
    this.oscillator16D?.stop()
    this.audioContext?.close()
    this.audioContext = null
  }
}
