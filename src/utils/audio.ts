import { getSharedSetting, isSupabaseConfigured, uploadMedia, saveSharedSetting } from '../supabase';

// Web Audio API Sound Synthesizer for Birthday Celebration
// No external MP3 dependencies - completely standalone and reliable

class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isMelodyPlaying: boolean = false;
  private melodyTimeouts: number[] = [];
  private customAudio: HTMLAudioElement | null = null;
  public customSongUrl: string | null = null;
  public customSongTitle: string = '';

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const savedUrl = localStorage.getItem('sakshi_custom_song_url');
        const savedTitle = localStorage.getItem('sakshi_custom_song_title');
        if (savedUrl) {
          this.customSongUrl = savedUrl;
          this.customSongTitle = savedTitle || "Sakshi's Uploaded Song 💕";
        }
      }
    } catch {
      // Ignore
    }

    // When configured, load the shared song URL so it works across devices, not just localStorage.
    if (isSupabaseConfigured()) {
      getSharedSetting<{ url?: string; title?: string; reset?: boolean }>('default_song')
        .then(async (sharedSong) => {
          if (sharedSong?.reset) {
            this.clearCustomSong();
            return;
          }
          if (sharedSong?.url) {
            this.setCustomSong(sharedSong.url, sharedSong.title || "Sakshi's Uploaded Song 💕");
            return;
          }
          // If this browser still has a legacy Base64 song, move it to Storage once.
          if (this.customSongUrl?.startsWith('data:')) {
            try {
              const publicUrl = await uploadMedia(this.customSongUrl, 'songs');
              const title = this.customSongTitle || "Sakshi's Uploaded Song 💕";
              await saveSharedSetting('default_song', { url: publicUrl, title });
              this.setCustomSong(publicUrl, title);
            } catch (error) {
              console.warn('Could not migrate the locally saved song to Supabase:', error);
            }
          }
        })
        .catch((error) => console.warn('Could not load the shared song from Supabase:', error));
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a soft gentle music-box bell tone
  playNote(frequency: number, duration: number = 0.5, delay: number = 0, volume: number = 0.15) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Music box / Celeste tone (sine with subtle overtone)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        console.warn('Audio playback error', e);
      }
    }, delay * 1000);
  }

  public resumeAudioContext(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  public currentSongTitle: string = '';

  // Happy Birthday melody frequencies (Key of C)
  // C4, D4, E4, F4, G4, A4, Bb4, C5
  playHappyBirthdayMelody(loop: boolean = false, onEnd?: () => void) {
    if (this.isMuted) return;
    this.stopMelody();
    this.isMelodyPlaying = true;
    this.currentSongTitle = 'Happy Birthday Chime';
    this.resumeAudioContext();

    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const Bb4 = 466.16;
    const C5 = 523.25;

    // Notes: note, duration (in seconds), delay (in seconds)
    const score: Array<[number, number, number]> = [
      // Hap-py Birth-day to you
      [C4, 0.4, 0.0],
      [C4, 0.4, 0.4],
      [D4, 0.6, 0.8],
      [C4, 0.6, 1.4],
      [F4, 0.6, 2.0],
      [E4, 1.0, 2.6],

      // Hap-py Birth-day to you
      [C4, 0.4, 3.8],
      [C4, 0.4, 4.2],
      [D4, 0.6, 4.6],
      [C4, 0.6, 5.2],
      [G4, 0.6, 5.8],
      [F4, 1.0, 6.4],

      // Hap-py Birth-day dear Sakshi
      [C4, 0.4, 7.6],
      [C4, 0.4, 8.0],
      [C5, 0.7, 8.4],
      [A4, 0.7, 9.1],
      [F4, 0.6, 9.8],
      [E4, 0.6, 10.4],
      [D4, 0.9, 11.0],

      // Hap-py Birth-day to you
      [Bb4, 0.4, 12.2],
      [Bb4, 0.4, 12.6],
      [A4, 0.7, 13.0],
      [F4, 0.7, 13.7],
      [G4, 0.7, 14.4],
      [F4, 1.4, 15.1],
    ];

    score.forEach(([freq, dur, del]) => {
      const tid = window.setTimeout(() => {
        if (!this.isMuted) {
          this.playNote(freq, dur * 1.5, 0, 0.18);
          // Add subtle harmonic octave for luxury music box sparkle
          this.playNote(freq * 2, dur * 0.8, 0.01, 0.06);
        }
      }, del * 1000);
      this.melodyTimeouts.push(tid);
    });

    const endTid = window.setTimeout(() => {
      this.isMelodyPlaying = false;
      this.currentSongTitle = '';
      if (onEnd) onEnd();
      if (loop && !this.isMuted) {
        this.playHappyBirthdayMelody(true, onEnd);
      }
    }, 16800);
    this.melodyTimeouts.push(endTid);
  }

  // Save custom uploaded song
  setCustomSong(url: string, title: string) {
    this.customSongUrl = url;
    this.customSongTitle = title || "Sakshi's Uploaded Song 💕";
    try {
      localStorage.setItem('sakshi_custom_song_url', url);
      localStorage.setItem('sakshi_custom_song_title', this.customSongTitle);
    } catch {
      // Ignore
    }
  }

  // Clear custom song and revert to Tum Hi Ho
  clearCustomSong() {
    this.stopMelody();
    this.customSongUrl = null;
    this.customSongTitle = '';
    try {
      localStorage.removeItem('sakshi_custom_song_url');
      localStorage.removeItem('sakshi_custom_song_title');
    } catch {
      // Ignore
    }
  }

  getFavoriteSongTitle(): string {
    return this.customSongTitle || "Sakshi's Favorite: Tum Hi Ho 💕";
  }

  // Play a song specific to a photo memory
  playPhotoSong(songUrl?: string, songTitle?: string, loop: boolean = true, onEnd?: () => void) {
    if (this.isMuted) return;
    this.stopMelody();
    this.isMelodyPlaying = true;
    this.resumeAudioContext();

    if (songUrl) {
      this.currentSongTitle = songTitle || "Photo's Song 🎵";
      try {
        if (!this.customAudio || this.customAudio.src !== songUrl) {
          this.customAudio = new Audio(songUrl);
        }
        this.customAudio.loop = loop;
        this.customAudio.volume = 0.85;
        this.customAudio.onended = () => {
          if (!loop) {
            this.isMelodyPlaying = false;
            this.currentSongTitle = '';
            onEnd?.();
          }
        };
        this.customAudio.play().catch((err) => {
          console.warn('Photo audio play failed, falling back to default favorite song:', err);
          this.playSakshiFavoriteSong(loop, onEnd);
        });
        return;
      } catch (err) {
        console.warn('Photo audio error:', err);
      }
    }

    // Default fallback
    this.playSakshiFavoriteSong(loop, onEnd);
  }

  // Plays Sakshi's Favorite Song: custom uploaded song if present, else synthesizes "Tum Hi Ho"
  playSakshiFavoriteSong(loop: boolean = false, onEnd?: () => void) {
    if (this.isMuted) return;
    this.stopMelody();
    this.isMelodyPlaying = true;
    this.resumeAudioContext();

    // If Sakshi uploaded her own song, play that custom audio!
    if (this.customSongUrl) {
      this.currentSongTitle = this.customSongTitle || "Sakshi's Uploaded Song 💕";
      try {
        if (!this.customAudio || this.customAudio.src !== this.customSongUrl) {
          this.customAudio = new Audio(this.customSongUrl);
        }
        this.customAudio.loop = loop;
        this.customAudio.volume = 0.85;
        this.customAudio.onended = () => {
          if (!loop) {
            this.isMelodyPlaying = false;
            this.currentSongTitle = '';
            onEnd?.();
          }
        };
        this.customAudio.play().catch((err) => {
          console.warn('Custom audio playback failed, falling back to synthesizer:', err);
          this.playTumHiHoSynthesis(loop, onEnd);
        });
        return;
      } catch (err) {
        console.warn('Audio element error:', err);
      }
    }

    // Default: synthesized "Tum Hi Ho" music box
    this.playTumHiHoSynthesis(loop, onEnd);
  }

  private playTumHiHoSynthesis(loop: boolean = false, onEnd?: () => void) {
    this.currentSongTitle = "Sakshi's Favorite: Tum Hi Ho 💕";

    const G3 = 196.00;
    const C4 = 261.63;
    const D4 = 293.66;
    const Eb4 = 311.13;
    const F4 = 349.23;
    const G4 = 392.00;
    const Ab4 = 415.30;
    const Bb4 = 466.16;
    const C5 = 523.25;

    // [freq, duration, delay]
    const tumHiHoScore: Array<[number, number, number]> = [
      // Hum tere bin ab reh nahi sakte
      [C4, 0.5, 0.0],
      [Eb4, 0.5, 0.5],
      [D4, 0.6, 1.0],
      [C4, 0.6, 1.6],
      [Eb4, 0.5, 2.3],
      [F4, 0.5, 2.8],
      [G4, 0.7, 3.3],
      [Ab4, 0.6, 4.0],
      [G4, 0.9, 4.6],

      // Tere bina kya wajood mera
      [F4, 0.5, 5.6],
      [Eb4, 0.5, 6.1],
      [D4, 0.6, 6.6],
      [Eb4, 0.5, 7.2],
      [F4, 0.5, 7.7],
      [Eb4, 0.5, 8.2],
      [D4, 0.6, 8.7],
      [C4, 1.1, 9.3],

      // Kyun ki tum hi ho, ab tum hi ho
      [C4, 0.4, 10.8],
      [D4, 0.4, 11.2],
      [Eb4, 0.5, 11.6],
      [F4, 0.5, 12.1],
      [G4, 0.7, 12.6],
      [Ab4, 0.6, 13.3],
      [G4, 0.5, 13.9],
      [F4, 0.5, 14.4],
      [Eb4, 0.8, 14.9],

      // Zindagi ab tum hi ho
      [D4, 0.4, 16.0],
      [Eb4, 0.4, 16.4],
      [F4, 0.5, 16.8],
      [Eb4, 0.5, 17.3],
      [D4, 0.6, 17.8],
      [C4, 1.4, 18.4],

      // Chain bhi, mera dard bhi
      [C4, 0.4, 20.0],
      [D4, 0.4, 20.4],
      [Eb4, 0.5, 20.8],
      [G4, 0.6, 21.3],
      [F4, 0.6, 21.9],
      [Eb4, 0.8, 22.5],

      // Meri aashiqui ab tum hi ho
      [D4, 0.4, 23.6],
      [Eb4, 0.4, 24.0],
      [F4, 0.5, 24.4],
      [Eb4, 0.5, 24.9],
      [D4, 0.6, 25.4],
      [C4, 1.8, 26.0],
    ];

    tumHiHoScore.forEach(([freq, dur, del]) => {
      const tid = window.setTimeout(() => {
        if (!this.isMuted) {
          this.playNote(freq, dur * 1.6, 0, 0.22);
          // High chime harmonic for sweet celestial music-box feel
          this.playNote(freq * 2, dur * 0.9, 0.02, 0.08);
        }
      }, del * 1000);
      this.melodyTimeouts.push(tid);
    });

    const endTid = window.setTimeout(() => {
      this.isMelodyPlaying = false;
      this.currentSongTitle = '';
      if (onEnd) onEnd();
      if (loop && !this.isMuted) {
        this.playSakshiFavoriteSong(true, onEnd);
      }
    }, 28500);
    this.melodyTimeouts.push(endTid);
  }

  stopMelody() {
    this.melodyTimeouts.forEach(t => clearTimeout(t));
    this.melodyTimeouts = [];
    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch {
        // Ignore
      }
    }
    this.isMelodyPlaying = false;
    this.currentSongTitle = '';
  }

  stop() {
    this.stopMelody();
  }

  getIsMelodyPlaying() {
    return this.isMelodyPlaying;
  }

  // Candle blow puff / gentle wind sound
  playBlowCandle() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      console.warn('Blow sound error', e);
    }
  }

  // Celebration chime / burst sound
  playConfettiBurst() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playNote(freq, 0.6, idx * 0.05, 0.12);
    });
  }

  // Page turn paper rustle
  playPageTurn() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      console.warn('Page turn sound error', e);
    }
  }

  // Sparkle chime on hover or tap
  playSparkle() {
    if (this.isMuted) return;
    const freqs = [880, 1174.66, 1396.91];
    freqs.forEach((f, i) => {
      this.playNote(f, 0.35, i * 0.04, 0.08);
    });
  }
}

export const soundManager = new BirthdayAudioEngine();
