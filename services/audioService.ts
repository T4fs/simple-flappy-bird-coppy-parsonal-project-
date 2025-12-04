class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isInit = false;

  initialize() {
    if (this.isInit) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.isInit = true;
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playScore() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playDie() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  startMusic() {
    if (!this.ctx || !this.masterGain) return;
    this.stopMusic(); // Ensure no duplicates
    this.resume();

    const t = this.ctx.currentTime;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.connect(this.masterGain);
    this.bgmGain.gain.value = 0.05;

    // Simple bassline loop
    const bassFreqs = [110, 110, 146, 130]; // A2, A2, D3, C3
    
    bassFreqs.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.connect(this.bgmGain!);
        osc.start(t);
        
        // Simple sequencing using LFO for volume to create rhythm
        const lfo = this.ctx!.createOscillator();
        lfo.type = 'square';
        lfo.frequency.value = 2; // 120 BPM approx
        const lfoGain = this.ctx!.createGain();
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain.gain);
        
        this.bgmOscillators.push(osc);
    });
  }

  stopMusic() {
    this.bgmOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
    });
    this.bgmOscillators = [];
    if (this.bgmGain) {
        this.bgmGain.disconnect();
        this.bgmGain = null;
    }
  }

  toggleMute(isMuted: boolean) {
      if (this.masterGain) {
          this.masterGain.gain.setTargetAtTime(isMuted ? 0 : 1, this.ctx?.currentTime || 0, 0.1);
      }
  }
}

export const audioService = new AudioService();