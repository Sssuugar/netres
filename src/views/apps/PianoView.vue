<template>
  <div class="app-container">
    <div class="mac-window">
      <header class="title-bar">
        <div class="traffic-lights">
          <span class="light red"></span>
          <span class="light yellow"></span>
          <span class="light green"></span>
        </div>
        <div class="window-title">🎹 Neon Synth Pro</div>
        <div class="header-status">
          <div class="status-dot" :class="{ active: isRecording, pulsing: isRecording }">
            {{ isRecording ? 'REC' : '' }}
          </div>
        </div>
      </header>

      <div class="window-content">
        
        <div class="keyboard-chassis">
          <div 
            v-for="(row, rIndex) in keyboardRows" 
            :key="rIndex" 
            class="keyboard-row"
            :class="`row-${rIndex}`"
          >
            <button
              v-for="keyConfig in row"
              :key="keyConfig.char"
              class="key-cap"
              :class="[
                keyConfig.type, /* dark-key 或 light-key */
                { 'active': activeKeys.has(keyConfig.note) },
                { 'auto-play': autoPlayingKeys.has(keyConfig.note) }
              ]"
              @mousedown="startNote(keyConfig.note)"
              @mouseup="stopNote(keyConfig.note)"
              @mouseleave="stopNote(keyConfig.note)"
              @touchstart.prevent="startNote(keyConfig.note)"
              @touchend.prevent="stopNote(keyConfig.note)"
            >
              <div class="key-surface">
                <span class="key-char">{{ keyConfig.charDisplay }}</span>
                <span class="key-note">{{ keyConfig.note }}</span>
                <div class="led-glow"></div>
              </div>
            </button>
          </div>
        </div>

      </div>

      <footer class="control-bar">
        <div class="lcd-display">
          <span class="label">CURRENT TRACK</span>
          <span class="value">{{ isCustomSongLoaded ? 'User Composition' : 'Demo: Canon in D' }}</span>
          <div class="progress-line" :style="{ width: (currentNoteIndex / currentSong.length) * 100 + '%' }"></div>
        </div>

        <div class="actions">
          <button class="glass-btn primary" @click="togglePlay">
            <span class="icon">{{ isSongPlaying ? '⏹' : '▶' }}</span>
            {{ isSongPlaying ? 'Stop' : 'Play' }}
          </button>
          <button class="glass-btn record" :class="{ 'is-recording': isRecording }" @click="toggleRecord">
            <span class="icon">●</span>
          </button>
          <button class="glass-btn icon-only" @click="showSheetEditor = !showSheetEditor">
            📜
          </button>
        </div>
      </footer>
    </div>

    <transition name="fade">
      <div class="editor-overlay" v-if="showSheetEditor" @click.self="showSheetEditor = false">
        <div class="editor-card">
          <div class="card-header">
            <h3>Score Editor</h3>
            <button @click="showSheetEditor = false">✕</button>
          </div>
          <textarea v-model="sheetMusicInput" spellcheck="false"></textarea>
          <div class="card-actions">
             <button class="glass-btn small" @click="loadCustomSong">Apply</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
// --- 逻辑部分保持不变，直接复用 ---
const NOTE_FREQUENCIES = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 184.99, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98
};

const KEY_TO_NOTE_MAP = {
  '1': 'C3', '2': 'C#3', '3': 'D3', '4': 'D#3', '5': 'E3', '6': 'F3', '7': 'F#3', '8': 'G3', '9': 'G#3', '0': 'A3', '-': 'A#3', '=': 'B3',
  'q': 'C4', 'w': 'C#4', 'e': 'D4', 'r': 'D#4', 't': 'E4', 'y': 'F4', 'u': 'F#4', 'i': 'G4', 'o': 'G#4', 'p': 'A4', '[': 'A#4', ']': 'B4',
  'a': 'C5', 's': 'C#5', 'd': 'D5', 'f': 'D#5', 'g': 'E5', 'h': 'F5', 'j': 'F#5', 'k': 'G5', 'l': 'G#5', ';': 'A5',
  'z': 'A#5', 'x': 'B5', 'c': 'C6', 'v': 'C#6', 'b': 'D6', 'n': 'D#6', 'm': 'E6', ',': 'F6', '.': 'F#6'
};

const PHYSICAL_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.']
];

const ADSR = { attackTime: 0.01, decayTime: 0.2, sustainLevel: 0.3, releaseTime: 0.3, initialVolume: 0.3 };

const SONG_NOTES_DEFAULT = [
  { notes: ['D3'], duration: 1200, pause: 50 }, { notes: ['D4', 'F#4', 'A4'], duration: 400, pause: 50 }, { notes: ['D4', 'F#4', 'A4'], duration: 400, pause: 50 },
  { notes: ['D4', 'F#4', 'A4'], duration: 400, pause: 50 }, { notes: ['A3'], duration: 1200, pause: 50 }, { notes: ['E4', 'A4', 'C#5'], duration: 400, pause: 50 },
  { notes: ['E4', 'A4', 'C#5'], duration: 400, pause: 50 }, { notes: ['E4', 'A4', 'C#5'], duration: 400, pause: 50 }, { notes: ['B3'], duration: 1200, pause: 50 },
  { notes: ['D4', 'F#4', 'B4'], duration: 400, pause: 50 }, { notes: ['D4', 'F#4', 'B4'], duration: 400, pause: 50 }, { notes: ['D4', 'F#4', 'B4'], duration: 400, pause: 50 },
  { notes: ['F#3'], duration: 1200, pause: 50 }, { notes: ['C#4', 'F#4', 'A4'], duration: 400, pause: 50 }, { notes: ['C#4', 'F#4', 'A4'], duration: 400, pause: 50 },
  { notes: ['C#4', 'F#4', 'A4'], duration: 400, pause: 50 }, { notes: ['D3', 'F#3', 'A3', 'D4'], duration: 2500, pause: 100 },
];

export default {
  data() {
    return {
      audioContext: null,
      activeOscillators: new Map(),
      activeKeys: new Set(),
      autoPlayingKeys: new Set(),
      keyboardRows: [],
      isSongPlaying: false,
      currentNoteIndex: 0,
      playTimeoutId: null,
      sheetMusicInput: '',
      currentSong: SONG_NOTES_DEFAULT,
      isCustomSongLoaded: false,
      isRecording: false,
      recordingStartTime: 0,
      recordedNotes: [],
      showSheetEditor: false
    };
  },
  created() { this.generateKeyboardLayout(); },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.sheetMusicInput = this.songToString(SONG_NOTES_DEFAULT);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.stopSong(true);
    this.stopRecording(true);
  },
  methods: {
    initAudio() {
      if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioContext.state === 'suspended') this.audioContext.resume();
    },
    generateKeyboardLayout() {
      this.keyboardRows = PHYSICAL_ROWS.map(rowChars => {
        return rowChars.map(char => {
          const note = KEY_TO_NOTE_MAP[char];
          if (!note) return null;
          return {
            char, charDisplay: char.toUpperCase(), note,
            type: note.includes('#') ? 'dark-key' : 'light-key'
          };
        }).filter(Boolean);
      });
    },
    noteToFrequency(note) { return NOTE_FREQUENCIES[note] || 0; },
    startNote(note, isAuto = false) {
      this.initAudio();
      if (this.activeOscillators.has(note) && !isAuto) return;
      if (!isAuto) { this.recordNoteEvent(note, 'start'); this.activeKeys.add(note); } else { this.autoPlayingKeys.add(note); }

      const frequency = this.noteToFrequency(note);
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sawtooth'; // 换成锯齿波，更有合成器感
      oscillator.frequency.setValueAtTime(frequency, now);
      
      // 增加一个低通滤波器，让声音不那么刺耳
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(ADSR.initialVolume, now + ADSR.attackTime);
      gainNode.gain.linearRampToValueAtTime(ADSR.sustainLevel * ADSR.initialVolume, now + ADSR.attackTime + ADSR.decayTime);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(now);
      
      this.activeOscillators.set(note, { oscillator, gainNode, isManualStart: !isAuto });
    },
    stopNote(note, fastRelease = false) {
      const active = this.activeOscillators.get(note);
      if (!active) return;
      if (active.isManualStart) { this.recordNoteEvent(note, 'stop'); this.activeKeys.delete(note); } else { this.autoPlayingKeys.delete(note); }
      const { oscillator, gainNode } = active;
      const now = this.audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      const release = fastRelease ? 0.05 : ADSR.releaseTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + release);
      oscillator.stop(now + release);
      this.activeOscillators.delete(note);
    },
    toggleRecord() { this.isRecording ? this.stopRecording() : this.startRecording(); },
    startRecording() {
      if (this.isSongPlaying) return;
      this.initAudio();
      this.recordedNotes = [];
      this.recordingStartTime = performance.now();
      this.isRecording = true;
    },
    stopRecording(isUnmounting = false) {
      if (!this.isRecording) return;
      const now = performance.now();
      this.activeOscillators.forEach((val, note) => {
        if (val.isManualStart) this.recordedNotes.push({ note, type: 'stop', time: now - this.recordingStartTime });
      });
      this.isRecording = false;
      if (isUnmounting || !this.recordedNotes.length) return;
      this.currentSong = this.processRecording();
      this.isCustomSongLoaded = true;
      this.sheetMusicInput = this.songToString(this.currentSong);
    },
    recordNoteEvent(note, type) {
      if (this.isRecording) this.recordedNotes.push({ note, type, time: Math.round(performance.now() - this.recordingStartTime) });
    },
    processRecording() {
      const raw = this.recordedNotes.sort((a, b) => a.time - b.time);
      const notes = [];
      const temp = new Map();
      raw.forEach(evt => {
        if (evt.type === 'start') temp.set(evt.note, evt.time);
        else if (temp.has(evt.note)) {
          notes.push({ note: evt.note, start: temp.get(evt.note), duration: evt.time - temp.get(evt.note) });
          temp.delete(evt.note);
        }
      });
      if (!notes.length) return [];
      notes.sort((a, b) => a.start - b.start);
      // 简化处理：不自动分组和弦，保持原始序列，简化逻辑以防出错
      return notes.map((n, i) => {
          const nextStart = notes[i+1] ? notes[i+1].start : n.start + n.duration;
          return { notes: [n.note], duration: n.duration, pause: Math.max(0, nextStart - (n.start + n.duration)) };
      });
    },
    togglePlay() { this.isSongPlaying ? this.stopSong() : this.playSong(); },
    playSong() {
      this.initAudio();
      if (!this.currentSong.length) return;
      this.isSongPlaying = true;
      this.currentNoteIndex = 0;
      this.playNextStep();
    },
    playNextStep() {
      if (!this.isSongPlaying || this.currentNoteIndex >= this.currentSong.length) { this.stopSong(); return; }
      const step = this.currentSong[this.currentNoteIndex];
      step.notes.forEach(n => this.startNote(n, true));
      setTimeout(() => step.notes.forEach(n => this.stopNote(n, true)), step.duration);
      this.currentNoteIndex++;
      this.playTimeoutId = setTimeout(() => this.playNextStep(), step.duration + step.pause);
    },
    stopSong(force = false) {
      clearTimeout(this.playTimeoutId);
      this.isSongPlaying = false;
      this.currentNoteIndex = 0;
      this.autoPlayingKeys.forEach(n => this.stopNote(n, true));
      if (force) this.activeKeys.forEach(n => this.stopNote(n, true));
    },
    songToString(song) { return song.map(n => `${n.notes.join(',')},${n.duration},${n.pause}`).join('\n'); },
    loadCustomSong() {
      const lines = this.sheetMusicInput.split('\n').filter(l => l.trim());
      try {
        this.currentSong = lines.map(line => {
          const parts = line.split(',');
          const pause = parseInt(parts.pop());
          const dur = parseInt(parts.pop());
          return { notes: parts, duration: dur, pause };
        });
        this.isCustomSongLoaded = true;
        this.showSheetEditor = false;
      } catch (e) { alert('Format Error'); }
    },
    handleKeyDown(e) { const note = KEY_TO_NOTE_MAP[e.key.toLowerCase()]; if (note && !e.repeat) this.startNote(note); },
    handleKeyUp(e) { const note = KEY_TO_NOTE_MAP[e.key.toLowerCase()]; if (note) this.stopNote(note); }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --bg-color: #121212;
  --window-bg: #1e1e1e;
  --chassis-color: #141414;
  --key-light-bg: #e0e0e0;
  --key-dark-bg: #2c2c2e;
  --accent-color: #29b6f6; /* 霓虹蓝 */
  --accent-glow: rgba(41, 182, 246, 0.6);
  --text-on-light: #333;
  --text-on-dark: #fff;
  --led-color: #00ff88;
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg-color);
  font-family: 'Inter', sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

/* --- 窗口整体 --- */
.mac-window {
  width: 100%;
  max-width: 900px;
  background: var(--window-bg);
  border-radius: 12px;
  box-shadow: 
    0 50px 100px -20px rgba(0,0,0,0.5), 
    0 30px 60px -30px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* --- 标题栏 --- */
.title-bar {
  height: 40px;
  background: linear-gradient(to bottom, #2d2d2d, #252525);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #000;
}
.traffic-lights { display: flex; gap: 8px; width: 60px; }
.light { width: 12px; height: 12px; border-radius: 50%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); }
.red { background: #ff5f56; border: 1px solid #e0443e; }
.yellow { background: #ffbd2e; border: 1px solid #dea123; }
.green { background: #27c93f; border: 1px solid #1aab29; }
.window-title { color: #888; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }

/* 录音状态灯 */
.status-dot { 
  width: 8px; height: 8px; border-radius: 50%; background: #333; 
  color: #ff5f56; font-size: 10px; font-weight: bold; padding-left: 12px; display: flex; align-items: center;
}
.status-dot.active { background: #ff5f56; box-shadow: 0 0 8px #ff5f56; }
.status-dot.pulsing { animation: blink 1s infinite; }

/* --- 主内容：键盘区域 --- */
.window-content {
  padding: 40px 20px;
  background: radial-gradient(circle at 50% 0%, #2a2a2a 0%, #111 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.keyboard-chassis {
  background: var(--chassis-color);
  padding: 15px;
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.6),
    inset 0 1px 1px rgba(255,255,255,0.05),
    0 -2px 1px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  gap: 8px; /* 行间距 */
  border: 1px solid #000;
}

.keyboard-row {
  display: flex;
  gap: 8px; /* 键间距 */
}

/* 错位实现：利用 margin-left */
.row-1 { margin-left: 20px; }
.row-2 { margin-left: 40px; }
.row-3 { margin-left: 70px; }

/* --- 键帽样式 (核心) --- */
.key-cap {
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 6px;
  position: relative;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: transform 0.05s ease;
  /* 移除默认点击蓝框 */
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.key-surface {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px 6px;
  box-sizing: border-box;
  
  /* 3D 效果：顶部亮边，底部厚度阴影 */
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.1),
    0 4px 0 rgba(0,0,0,0.3), /* 侧面厚度 */
    0 5px 5px rgba(0,0,0,0.2); /* 投射阴影 */
  
  transition: all 0.05s ease;
}

/* 亮色键（白键音） */
.key-cap.light-key .key-surface {
  background: linear-gradient(to bottom, #dcdcdc, #c0c0c0);
  color: #333;
  border-top: 1px solid rgba(255,255,255,0.4);
}
.key-cap.light-key .key-note { color: #666; font-weight: bold; }

/* 暗色键（黑键音 - 升降调） */
.key-cap.dark-key .key-surface {
  background: linear-gradient(to bottom, #3a3a3a, #2b2b2b);
  color: #ccc;
  border-top: 1px solid rgba(255,255,255,0.1);
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 4px 0 #111,
    0 5px 5px rgba(0,0,0,0.4);
}
.key-cap.dark-key .key-note { color: var(--accent-color); text-shadow: 0 0 5px rgba(41, 182, 246, 0.4); }

/* 文字样式 */
.key-char { font-size: 10px; font-weight: 700; align-self: flex-start; opacity: 0.7; }
.key-note { font-size: 11px; align-self: flex-end; }

/* 激活状态 */
.key-cap:active, .key-cap.active, .key-cap.auto-play {
  transform: translateY(4px); /* 视觉上下沉 */
}

.key-cap:active .key-surface, 
.key-cap.active .key-surface,
.key-cap.auto-play .key-surface {
  box-shadow: 
    inset 0 2px 5px rgba(0,0,0,0.2), /* 内部凹陷 */
    0 0 0 rgba(0,0,0,0.3); /* 去掉厚度阴影 */
  background: #fff;
  border-color: var(--accent-color);
}
.key-cap.active .key-note, .key-cap.auto-play .key-note { color: var(--accent-color); }
.key-cap.active .led-glow, .key-cap.auto-play .led-glow {
  opacity: 1;
  box-shadow: 0 0 15px var(--accent-color);
}

/* 底部光条（装饰） */
.led-glow {
  position: absolute; bottom: -2px; left: 10%; right: 10%; height: 2px;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.1s;
  border-radius: 2px;
}

/* --- 底部控制栏 --- */
.control-bar {
  height: 60px;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.lcd-display {
  flex: 1;
  max-width: 300px;
  height: 36px;
  background: #111;
  border-radius: 4px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  position: relative;
  overflow: hidden;
}
.lcd-display .label { font-size: 8px; color: #555; letter-spacing: 1px; }
.lcd-display .value { font-size: 12px; color: var(--accent-color); font-family: monospace; white-space: nowrap; z-index: 2; }
.progress-line { position: absolute; bottom: 0; left: 0; height: 2px; background: var(--accent-color); z-index: 1; transition: width 0.1s linear; }

.actions { display: flex; gap: 10px; }
.glass-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.glass-btn:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
.glass-btn:active { transform: scale(0.96); }
.glass-btn.primary { background: var(--accent-color); color: #000; font-weight: 600; border: none; }
.glass-btn.record.is-recording { background: #ff5f56; border: none; color: #fff; animation: blink 1s infinite; }

/* --- 弹窗 --- */
.editor-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center; z-index: 100;
  backdrop-filter: blur(5px);
}
.editor-card {
  width: 400px; background: #222; border: 1px solid #444; border-radius: 12px; padding: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.card-header { display: flex; justify-content: space-between; margin-bottom: 15px; color: #fff; }
.card-header button { background: none; border: none; color: #888; cursor: pointer; font-size: 16px; }
textarea { 
  width: 100%; height: 150px; background: #111; border: 1px solid #333; 
  color: #ddd; padding: 10px; border-radius: 6px; font-family: monospace; box-sizing: border-box; resize: none;
}
.card-actions { margin-top: 15px; display: flex; justify-content: flex-end; }

@keyframes blink { 50% { opacity: 0.5; } }
</style>