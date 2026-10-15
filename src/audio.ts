export class AudioManager {
    context?: AudioContext;
    musicTimer?: number;
    last = 0;
    sound = true;
    music = true;
    unlock() { this.context ??= new AudioContext(); void this.context.resume(); if (!this.musicTimer)
        this.musicTimer = window.setInterval(() => { if (this.music)
            this.tone(55, 1.4, .018, 'sine'); }, 1600); }
    tone(frequency: number, duration = .1, volume = .06, type: OscillatorType = 'triangle') { if (!this.context)
        return; const t = this.context.currentTime, o = this.context.createOscillator(), g = this.context.createGain(); o.type = type; o.frequency.setValueAtTime(frequency, t); o.frequency.exponentialRampToValueAtTime(Math.max(25, frequency * .45), t + duration); g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(.001, t + duration); o.connect(g); g.connect(this.context.destination); o.start(t); o.stop(t + duration); }
    play(kind: string) { if (!this.sound)
        return; const now = performance.now(); if (['hit', 'xp', 'death'].includes(kind) && now - this.last < 45)
        return; this.last = now; const f: Record<string, number> = { katana:330,dual:410,nodachi:130,cursed:165,pistols:290,shotgun:95,shield:140,spiked:190,kama:310,naginata:180,smg:260,hammer:65,overdrive:540,slam:80,attack: 230, hit: 150, critical: 490, death: 95, hurt: 70, xp: 690, gold: 900, level: 1100, ability: 350, wave: 420, clear: 700, elite: 55, boss: 35, buy: 1000, over: 60 }; this.tone(f[kind] || 220, ['boss','over','level','hammer','slam'].includes(kind) ? .45 : .09, .045, kind==='smg'?'square':kind === 'hurt' ? 'sawtooth' : 'triangle'); }
}
