// Bộ xử lý âm thanh Game Show tích hợp Web Audio API thuần
// Hoạt động 100% Offline, không phụ thuộc vào file MP3 tải từ internet

class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.suspenseNode = null;
  }

  // Khởi tạo AudioContext sau lần tương tác đầu tiên của người dùng
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.suspenseNode) {
      this.stopSuspense();
    }
    return this.isMuted;
  }

  // Phát một nốt nhạc cơ bản với phong bì ADSR
  playTone(freq, type = "sine", duration = 0.2, gainLevel = 0.3, delay = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Tiếng tích tắc đếm ngược 15 giây
  playTick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, startTime);
    osc.frequency.exponentialRampToValueAtTime(400, startTime + 0.05);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.05);
  }

  // Tiếng còi hết giờ (Time's Up)
  playTimesUp() {
    if (this.isMuted) return;
    this.init();
    this.playTone(280, "sawtooth", 0.4, 0.4);
    this.playTone(220, "sawtooth", 0.6, 0.4, 0.25);
  }

  // Tiếng chuông bấm giành quyền trả lời (Buzzer)
  playBuzzer() {
    if (this.isMuted) return;
    this.init();
    this.playTone(987.77, "sine", 0.15, 0.4, 0);    // B5
    this.playTone(1318.51, "triangle", 0.35, 0.45, 0.08); // E6
  }

  // Tiếng trả lời đúng (Ding Ding vui tươi - Hợp âm Trưởng)
  playCorrect() {
    if (this.isMuted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, "sine", 0.3, 0.35, idx * 0.08);
    });
  }

  // Tiếng trả lời sai (Buzz trầm)
  playWrong() {
    if (this.isMuted) return;
    this.init();
    this.playTone(240, "sawtooth", 0.2, 0.35, 0);
    this.playTone(180, "sawtooth", 0.35, 0.4, 0.15);
  }

  // Tiếng lật từng ô chữ
  playFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(600, startTime);
    osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.08);

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.08);
  }

  // Khúc nhạc chiến thắng hào hùng (Fanfare)
  playVictory() {
    if (this.isMuted) return;
    this.init();
    const melody = [
      { f: 523.25, d: 0.15, delay: 0 },    // C5
      { f: 523.25, d: 0.15, delay: 0.15 }, // C5
      { f: 523.25, d: 0.15, delay: 0.3 },  // C5
      { f: 659.25, d: 0.4,  delay: 0.45 }, // E5
      { f: 783.99, d: 0.3,  delay: 0.9 },  // G5
      { f: 659.25, d: 0.2,  delay: 1.25 }, // E5
      { f: 1046.50, d: 0.8, delay: 1.5 }  // C6
    ];

    melody.forEach(item => {
      this.playTone(item.f, "triangle", item.d, 0.4, item.delay);
      this.playTone(item.f * 1.002, "sine", item.d, 0.3, item.delay);
    });
  }
}

// Khởi tạo đối tượng toàn cục
window.soundFX = new SoundFX();
