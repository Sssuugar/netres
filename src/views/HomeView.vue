<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FloatingBackgroundText from '@/components/FloatingBackgroundText.vue';
import { SVG_BAIDU, SVG_GOOGLE } from '@/js/svg-icons.js';

const currentSearchEngine = ref('baidu'); // 'baidu' or 'google'
const searchQuery = ref('');
const isSearchBoxFocused = ref(false);

// Slogan Logic
const slogans = [
  '超越极限', // 00:00 - 01:59
  '突破自我', // 02:00 - 03:59
  '极致探索', // 04:00 - 05:59
  '勇往直前', // 06:00 - 07:59
  '步履不停', // 08:00 - 09:59
  '耕耘不辍', // 10:00 - 11:59
  '精益求精', // 12:00 - 13:59
  '止于至善', // 14:00 - 15:59
  '进无止境', // 16:00 - 17:59
  '生生不息', // 18:00 - 19:59
  '野蛮生长', // 20:00 - 21:59
  '向阳而生'  // 22:00 - 23:59
];

const currentSlogan = ref('');
let sloganInterval;

const updateSlogan = () => {
  const currentHour = new Date().getHours();
  const index = Math.floor(currentHour / 2);
  currentSlogan.value = slogans[index % slogans.length];
};

onMounted(() => {
  updateSlogan();
  // Check every minute to update the slogan if needed
  sloganInterval = setInterval(updateSlogan, 60000);
});

onUnmounted(() => {
  if (sloganInterval) clearInterval(sloganInterval);
});

// Calculate search URL
const searchUrl = computed(() => {
  if (currentSearchEngine.value === 'baidu') {
    return `https://www.baidu.com/s?wd=${encodeURIComponent(searchQuery.value)}`;
  } else {
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery.value)}`;
  }
});

// Perform Search
const performSearch = () => {
  if (searchQuery.value.trim()) {
    window.open(searchUrl.value, '_blank');
  }
};

// Toggle Engine
const toggleEngine = () => {
  currentSearchEngine.value = currentSearchEngine.value === 'baidu' ? 'google' : 'baidu';
};
</script>

<template>
  <div class="home-search-page">
    <!-- Immersive Background Wrapper -->
    <div class="background-wrapper" :class="{ 'dimmed': isSearchBoxFocused }">
      <div class="background-gradient"></div>
      <div class="background-dots"></div>
      <FloatingBackgroundText />
    </div>

    <div class="search-container">
      <h1 class="page-title" :class="{ 'dimmed': isSearchBoxFocused }">{{ currentSlogan }}</h1>
      
      <!-- Crystal Prism Search Box -->
      <div 
        class="crystal-search-box" 
        :class="{ focused: isSearchBoxFocused }"
      >
        <!-- Glowing Border Effect -->
        <div class="crystal-border"></div>
        
        <!-- Engine Switcher (Icon Based) -->
        <div class="engine-switcher" @click="toggleEngine" :title="`Switch to ${currentSearchEngine === 'baidu' ? 'Google' : 'Baidu'}`">
          <div class="switcher-track">
            <div class="switcher-thumb" :class="currentSearchEngine">
              <span v-if="currentSearchEngine === 'baidu'" class="engine-icon" v-html="SVG_BAIDU"></span>
              <span v-else class="engine-icon" v-html="SVG_GOOGLE"></span>
            </div>
          </div>
        </div>

        <input 
          type="text" 
          v-model="searchQuery" 
          @keyup.enter="performSearch" 
          :placeholder="`使用 ${currentSearchEngine === 'baidu' ? '百度' : 'Google'} 搜索`"
          class="search-input"
          @focus="isSearchBoxFocused = true"
          @blur="isSearchBoxFocused = false"
        />
        
        <button class="search-btn" @click="performSearch">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;800;900&display=swap');

/* Main Layout */
.home-search-page {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center; /* Center Vertically */
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  color: #fff;
}

/* Background Wrapper for Dimming */
.background-wrapper {
  position: absolute;
  inset: 0;
  z-index: -1;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.background-wrapper.dimmed {
  filter: blur(10px) brightness(0.6);
  transform: scale(1.05); /* Subtle zoom */
}

/* Dynamic Gradient Background */
.background-gradient {
  position: absolute;
  inset: -20%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(76, 29, 149, 0.4), transparent 50%), /* Deep Purple */
    radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.4), transparent 50%), /* Sky Blue */
    radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.4), transparent 50%); /* Pink */
  background-size: 200% 200%;
  animation: bgShift 30s ease infinite alternate;
  filter: blur(80px);
  opacity: 0.7;
}

@keyframes bgShift {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.background-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 100%); /* Vignette */
  opacity: 0.5;
}

/* Search Container */
.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  z-index: 10;
  padding-bottom: 10vh; /* Adjust vertical center */
}

/* Page Title with Hollow Effect */
.page-title {
  font-size: 5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -2px;
  margin-bottom: 3rem;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.2) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  filter: drop-shadow(0 0 30px rgba(255,255,255,0.1));
  transition: all 0.5s ease;
}

.page-title.dimmed {
  opacity: 0;
  transform: translateY(-20px);
  filter: blur(10px);
}

/* ---------------------------------- */
/* CRYSTAL SEARCH BOX - The Prism */
/* ---------------------------------- */
.crystal-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 680px;
  height: 72px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px; /* Squircle (between rect and pill) */
  box-shadow: 
    0 20px 40px -10px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
}

/* Animated Glowing Border */
.crystal-border {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px; /* Border width */
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.5;
}

.crystal-search-box:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 
    0 30px 60px -15px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.crystal-search-box.focused {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.02);
  box-shadow: 
    0 40px 80px -20px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.1), /* Outer ring */
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Engine Switcher */
.engine-switcher {
  padding-left: 16px;
  cursor: pointer;
  z-index: 2;
}

.switcher-track {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.switcher-track:hover {
  background: rgba(0, 0, 0, 0.4);
}

.switcher-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.engine-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.engine-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.switcher-thumb.google {
  transform: rotate(360deg);
}

.switcher-thumb.baidu {
  transform: rotate(0deg);
}

/* Input Field */
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0 20px;
  font-size: 1.2rem;
  color: #fff;
  font-weight: 500;
  outline: none;
  height: 100%;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;
  transition: color 0.3s;
}

.crystal-search-box.focused .search-input::placeholder {
  color: rgba(255, 255, 255, 0.1);
}

/* Search Button */
.search-btn {
  width: 60px;
  height: 100%;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  color: #fff;
  transform: scale(1.1);
}

.crystal-search-box.focused .search-btn {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>
