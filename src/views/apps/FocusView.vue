<template>
  <div class="focus-container" @mousemove="handleMouseMove">
    <!-- Video Background -->
    <video 
        ref="bgVideo"
        class="bg-video" 
        :src="videoSrc"
        loop
        playsinline
        crossorigin="anonymous"
    >
    </video>

    <!-- Dark Overlay for Readability -->
    <div class="overlay-dim" :class="{ 'faded': isFocusing }"></div>

    <!-- Main Setup Card -->
    <transition name="fade-scale">
        <div class="floating-card" v-if="!isFocusing">
            
            <!-- Timer Display -->
            <div class="timer-section">
                <div class="timer-display">
                    {{ formattedTime }}
                </div>
            </div>

            <!-- Controls -->
            <div class="controls-section">
                <button 
                    class="btn-primary" 
                    @click="startFocus"
                >
                    <span class="icon">Start Focus</span>
                    <span class="label">开始专注</span>
                </button>
                
                <div class="settings-row">
                    <button class="btn-text" @click="toggleTimerMode">
                        {{ isCountDown ? '倒计时' : '正计时' }}
                    </button>
                    
                    <div class="input-wrapper" v-if="isCountDown">
                        <input 
                            type="number" 
                            v-model.number="inputMinutes" 
                            min="1" 
                            max="180"
                            class="time-input"
                        >
                        <span class="unit">min</span>
                    </div>
                </div>
            </div>

            <!-- Audio Control -->
            <div class="audio-section">
                 <button class="btn-icon-small" @click="toggleMute">
                     <span v-if="isMuted">🔇</span>
                     <span v-else>🔊</span>
                 </button>
                 <div class="slider-container" :class="{ 'disabled': isMuted }">
                     <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        v-model.number="volume"
                        @input="updateVolume"
                    >
                 </div>
            </div>
        </div>
    </transition>

    <!-- Floating Side Ball (Focus Mode) -->
    <transition name="slide-right">
        <div 
            class="focus-ball" 
            v-if="isFocusing"
            @mouseenter="isHoveringBall = true"
            @mouseleave="isHoveringBall = false"
            :class="{ 'expanded': isHoveringBall }"
        >
            <div class="ball-content">
                <div class="mini-timer" v-show="!isHoveringBall">
                    {{ timeRemainingMinutes }}
                </div>
                <div class="full-timer" v-show="isHoveringBall">
                    {{ formattedTime }}
                </div>
                
                <button 
                    class="btn-stop-mini" 
                    v-show="isHoveringBall" 
                    @click="stopFocus"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    <span>停止</span>
                </button>
            </div>
            
            <!-- Mini Audio Toggle on hover -->
             <div class="mini-audio" v-show="isHoveringBall">
                 <button class="btn-icon-tiny" @click.stop="toggleMute">
                     <span v-if="isMuted">🔇</span>
                     <span v-else>🔊</span>
                 </button>
             </div>
        </div>
    </transition>

    <!-- Exit Button (Top Right) -->
    <router-link to="/apps" class="exit-btn" title="退出" v-show="!isFocusing">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
    </router-link>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';

// --- State ---
const bgVideo = ref(null);
const videoSrc = ref('');
const localVideoPath = '/sleep/13412182403661863_20260106_22191731.mp4';
const isFocusing = ref(false);
const isCountDown = ref(true); 
const inputMinutes = ref(25);
const timeRemaining = ref(25 * 60);
const elapsedTime = ref(0);
const timerInterval = ref(null);
const isHoveringBall = ref(false);

// --- Audio State ---
const isMuted = ref(false);
const volume = ref(0.5);

// --- Timer Logic ---
const formattedTime = computed(() => {
  let seconds = isCountDown.value ? timeRemaining.value : elapsedTime.value;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const timeRemainingMinutes = computed(() => {
    let seconds = isCountDown.value ? timeRemaining.value : elapsedTime.value;
    return Math.ceil(seconds / 60);
});

const toggleTimerMode = () => {
    isCountDown.value = !isCountDown.value;
    resetTimer();
};

const resetTimer = () => {
    if (isCountDown.value) {
        timeRemaining.value = inputMinutes.value * 60;
    } else {
        elapsedTime.value = 0;
    }
};

const startFocus = () => {
  isFocusing.value = true;
  
  // Lazy Load Video
  if (!videoSrc.value) {
      videoSrc.value = localVideoPath;
      nextTick(() => {
          if (bgVideo.value) {
              bgVideo.value.volume = volume.value;
              bgVideo.value.play().catch(e => console.log('Autoplay prevented:', e));
          }
      });
  } else {
      // Resume if already loaded
       if (bgVideo.value && bgVideo.value.paused) {
          bgVideo.value.play().catch(e => console.log('Autoplay prevented:', e));
      }
  }

  if (isCountDown.value) {
      timeRemaining.value = inputMinutes.value * 60;
  } else {
      elapsedTime.value = 0;
  }

  timerInterval.value = setInterval(() => {
    if (isCountDown.value) {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        stopFocus();
        // Optional: Play a done sound or visual cue
      }
    } else {
      elapsedTime.value++;
    }
  }, 1000);
};

const stopFocus = () => {
  isFocusing.value = false;
  isHoveringBall.value = false;
  clearInterval(timerInterval.value);
  timerInterval.value = null;
  
  // Optional: Pause video when stopping focus to save resources
  if (bgVideo.value) {
      bgVideo.value.pause();
  }
};

// --- Audio / Video Control ---

const toggleMute = () => {
    if (!bgVideo.value) return;
    isMuted.value = !isMuted.value;
    bgVideo.value.muted = isMuted.value;
};

const updateVolume = () => {
    if (!bgVideo.value) return;
    bgVideo.value.volume = volume.value;
    if (volume.value > 0 && isMuted.value) {
        isMuted.value = false;
        bgVideo.value.muted = false;
    }
};

const handleMouseMove = () => {
    // Only used if needed for other UI elements
};

// --- Lifecycle ---
onMounted(() => {
    // Re-verify volume init if needed, but video load is now lazy
});

onUnmounted(() => {
    clearInterval(timerInterval.value);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;600&display=swap');

.focus-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    color: white;
    font-family: 'Outfit', sans-serif;
    background: black;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Background Video */
.bg-video {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    transform: translate(-50%, -50%);
    z-index: 0;
    filter: brightness(0.9);
    transition: filter 0.5s ease;
}

.overlay-dim {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
    transition: opacity 0.5s ease;
}

.overlay-dim.faded {
    opacity: 0; /* Fully transparent when focused */
}

/* Floating Glass Card (Main Setup) */
.floating-card {
    position: relative;
    z-index: 10;
    background: rgba(20, 20, 20, 0.4);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    border-radius: 32px;
    padding: 60px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    min-width: 400px;
}

/* Timer Section */
.timer-section {
    text-align: center;
}

.timer-display {
    font-size: 6rem;
    font-weight: 200;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -2px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

/* Controls Section */
.controls-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.btn-primary {
    background: white;
    color: black;
    border: none;
    padding: 16px 40px;
    border-radius: 100px;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255,255,255,0.1);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255,255,255,0.2);
}

.btn-primary .icon {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
    opacity: 0.7;
    margin-bottom: 2px;
}

.btn-primary .label {
    font-size: 1.1rem;
    font-weight: 600;
}

.settings-row {
    display: flex;
    align-items: center;
    gap: 16px;
    color: rgba(255,255,255,0.6);
}

.btn-text {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 0.95rem;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.2s;
}

.btn-text:hover {
    background: rgba(255,255,255,0.1);
    color: white;
}

.input-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0,0,0,0.2);
    padding: 4px 10px;
    border-radius: 8px;
}

.time-input {
    background: transparent;
    border: none;
    color: white;
    width: 36px;
    text-align: center;
    font-size: 1rem;
    font-family: inherit;
}

.time-input:focus {
    outline: none;
}

.unit {
    font-size: 0.8rem;
    opacity: 0.7;
}

/* Audio Section */
.audio-section {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.1);
}

.btn-icon-small {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.8);
    font-size: 1.2rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.btn-icon-small:hover {
    background: rgba(255,255,255,0.1);
}

.slider-container {
    flex: 1;
    display: flex;
    align-items: center;
}

.slider-container.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.slider-container input[type=range] {
    width: 100%;
    accent-color: white;
    height: 4px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    cursor: pointer;
}

/* --- Floating Side Ball --- */
.focus-ball {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    border-radius: 30px; /* Pillow shape or Circle depending on expansion */
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 50;
    overflow: hidden;
}

.focus-ball:hover, .focus-ball.expanded {
    width: 160px;
    height: 180px;
    border-radius: 20px;
    background: rgba(20, 20, 20, 0.7);
}

.ball-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 16px;
}

.mini-timer {
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
}

.full-timer {
    font-size: 2.5rem;
    font-weight: 200;
    font-variant-numeric: tabular-nums;
    line-height: 1;
}

.btn-stop-mini {
    background: rgba(255, 69, 58, 0.9);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-stop-mini:hover {
    transform: scale(1.05);
}

.mini-audio {
    position: absolute;
    bottom: 12px;
    width: 100%;
    display: flex;
    justify-content: center;
}

.btn-icon-tiny {
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    font-size: 1rem;
}

.btn-icon-tiny:hover {
    color: white;
}


/* Exit Button */
.exit-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 20;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s;
    border: 1px solid rgba(255,255,255,0.05);
}

.exit-btn:hover {
    background: rgba(255,255,255,0.15);
    transform: rotate(90deg);
}

.exit-btn svg {
    width: 24px;
    height: 24px;
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.4s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
    transform: translate(100%, -50%); /* Slide out to right */
    opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 600px) {
    .floating-card {
        width: 90vw;
        min-width: auto;
        padding: 40px 20px;
    }
    .timer-display {
        font-size: 4rem;
    }
    .focus-ball {
        right: 10px;
    }
}
</style>
