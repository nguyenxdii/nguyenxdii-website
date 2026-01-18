// Game Sound Effects System
// Uses Web Audio API to generate retro-style sounds

class GameSounds {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
  }

  // Resume audio context (required after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  // Generate a beep sound
  playBeep(frequency = 440, duration = 0.1, type = "square") {
    if (!this.enabled) return;
    this.init();
    this.resume();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 2048 Sounds
  playMove() {
    this.playBeep(200, 0.05, "sine");
  }

  playMerge() {
    this.playBeep(400, 0.1, "sine");
    setTimeout(() => this.playBeep(500, 0.1, "sine"), 50);
  }

  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.2, "sine"), i * 100);
    });
  }

  playGameOver() {
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.2, "sine"), i * 150);
    });
  }

  // Tetris Sounds
  playTetrisMove() {
    // Tiếng nhẹ nhàng khi di chuyển - triangle wave êm hơn
    this.playBeep(280, 0.025, "triangle");
  }

  playTetrisRotate() {
    // Âm thanh xoay - tiếng "whoosh" nhẹ
    this.playBeep(350, 0.06, "sine");
    setTimeout(() => this.playBeep(420, 0.04, "sine"), 30);
  }

  playTetrisDrop() {
    this.playBeep(100, 0.1, "triangle");
  }

  playTetrisLock() {
    // Âm thanh đặt block - tiếng "click" rõ ràng
    this.playBeep(240, 0.12, "triangle");
    setTimeout(() => this.playBeep(200, 0.1, "triangle"), 40);
  }

  playTetrisClearLine() {
    const notes = [523, 659, 784, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.1, "square"), i * 50);
    });
  }

  playTetrisLevelUp() {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.15, "sine"), i * 80);
    });
  }

  playTetrisGameOver() {
    const notes = [440, 415, 392, 349, 330];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.25, "sawtooth"), i * 200);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Create global instance
const gameSounds = new GameSounds();
