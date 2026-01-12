<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
// 资源引用
import bgImage from '@/assets/author_intro_bg.png';

// 状态
const containerRef = ref(null);
const progress = ref(0);

// Scroll Handler
const handleScroll = () => {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementHeight = rect.height;
    
    // progress logic: 0 when sticky starts, 1 when sticky ends
    const scrollDistance = elementHeight - windowHeight;
    let rawProgress = -rect.top / scrollDistance;
    progress.value = Math.max(0, Math.min(1, rawProgress));
};

onMounted(() => {
    const scroller = document.querySelector('.main-content');
    if (scroller) {
        scroller.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }
});

onUnmounted(() => {
    const scroller = document.querySelector('.main-content');
    if (scroller && handleScroll) {
        scroller.removeEventListener('scroll', handleScroll);
    }
});

/* -------------------- ANIMATION LOGIC -------------------- */

// Phase 1: 0.0 - 0.4 -> Whole Group Shrink (1 -> 0.8), Text Reveal
const phase1Progress = computed(() => Math.min(1, progress.value / 0.4));

const groupScale = computed(() => {
    return 1 - (phase1Progress.value * 0.2); // 1.0 -> 0.8
});

// Text Logic: Fly UP from BEHIND
const textOpacity = computed(() => {
    // Reveal 0-0.3
    const reveal = Math.min(1, phase1Progress.value / 0.75);
    // Fade out 0.4-0.5
    if (progress.value > 0.4) {
        const fadeP = (progress.value - 0.4) / 0.1;
        return 1 - Math.min(1, fadeP);
    }
    return reveal;
});

const textTranslateY = computed(() => {
    // Start lower (hidden behind image roughly) and move up
    // Let's say image is center. Text starts at 0 (center) and moves to -150px (top)
    // Actually, user wants "appear from behind".
    // If text is z-index -1, and starts at center, it is covered.
    // Then it moves UP (-y) to be visible above the image?
    // "Appearance from behind the image... fly up"
    return 0 - (phase1Progress.value * 250); // 0 -> -250px
});

// Phase 2: Split (0.5 - 0.7)
const splitProgress = computed(() => {
    const start = 0.5, end = 0.7;
    if (progress.value < start) return 0;
    if (progress.value > end) return 1;
    return (progress.value - start) / (end - start);
});

// Phase 3: Fan/Flip (0.7 - 1.0)
const fanProgress = computed(() => {
    const start = 0.7, end = 0.9;
    if (progress.value < start) return 0;
    if (progress.value > end) return 1;
    return (progress.value - start) / (end - start);
});

const isFlipped = computed(() => progress.value > 0.85);

// Card Transforms
// Initially: Left is -100%, Right is +100% relative to center card width (200px)
const cardOffset = 100; // 100% of card width

const leftCardStyle = computed(() => {
    // Initial: -99.5% (Overlap to hide gaps)
    // Split: Move further left to -115% or more
    const base = -99.5;
    const split = splitProgress.value * -15.5; // -99.5% -> -115%
    const rot = fanProgress.value * -15; // Rotate -15deg
    return {
        transform: `translateX(${base + split}%) rotate(${rot}deg)`
    };
});

const rightCardStyle = computed(() => {
    const base = 99.5;
    const split = splitProgress.value * 15.5; // 99.5% -> 115%
    const rot = fanProgress.value * 15; // Rotate +15deg
    return {
        transform: `translateX(${base + split}%) rotate(${rot}deg)`
    };
});

// Dynamic Styles for Seamless Effect
const maxRadius = 24; // px - Increased to make them look more "whole"

const leftBorderRadius = computed(() => {
    // Initial: 16px 0 0 16px
    // Split: 24px 24px 24px 24px
    // Inner corners (top-right, bottom-right) need to go from 0 -> 24
    const innerRadius = splitProgress.value * maxRadius;
    const outerRadius = 16 + (splitProgress.value * (maxRadius - 16)); // 16 -> 24
    return `${outerRadius}px ${innerRadius}px ${innerRadius}px ${outerRadius}px`;
});

const centerBorderRadius = computed(() => {
    // Initial: 0 0 0 0
    // Split: 24px ...
    const radius = splitProgress.value * maxRadius;
    return `${radius}px`;
});

const rightBorderRadius = computed(() => {
    const innerRadius = splitProgress.value * maxRadius;
    const outerRadius = 16 + (splitProgress.value * (maxRadius - 16)); // 16 -> 24
    return `${innerRadius}px ${outerRadius}px ${outerRadius}px ${innerRadius}px`;
});

const dynamicShadow = computed(() => {
    // Initial: None
    // Split: 0 20px 50px rgba(0,0,0,0.3)
    const opacity = splitProgress.value * 0.3;
    return `0 20px 50px rgba(0,0,0,${opacity})`;
});

</script>

<template>
  <div class="author-intro-scroll-container" ref="containerRef">
    <div class="sticky-wrapper">
      <div class="stage">
          
          <!-- Flying Text (Behind Image) -->
          <div 
            class="fly-text"
            :style="{
                opacity: textOpacity,
                transform: `translate(-50%, ${textTranslateY}%)`, 
            }"
          >
            <h1>重塑<br>数字审美</h1>
            <p>在代码与艺术的边界，<br>寻找感性的共鸣。</p>
          </div>

          <!-- Cards Group (Scales Together) -->
          <div class="cards-group" :class="{ 'flipped': isFlipped }" :style="{ transform: `scale(${groupScale})` }">
              
              <!-- Left Slice -->
              <div class="card-slot left" :style="leftCardStyle">
                 <div class="card-inner" :style="{ borderRadius: leftBorderRadius, boxShadow: dynamicShadow }">
                    <div class="card-front" :style="{ backgroundImage: `url(${bgImage})`, backgroundPosition: '0% 50%' }"></div>
                    <div class="card-back content-layout">
                        <!-- Icon: User -->
                        <div class="card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div class="card-main-text">
                            <h3>Sssuugar</h3>
                        </div>
                        <div class="card-footer-text">
                            <p>1999年生。</p>
                        </div>
                    </div>
                 </div>
              </div>

              <!-- Center Slice -->
              <div class="card-slot center">
                 <div class="card-inner" :style="{ borderRadius: centerBorderRadius, boxShadow: dynamicShadow }">
                    <div class="card-front" :style="{ backgroundImage: `url(${bgImage})`, backgroundPosition: '50% 50%' }"></div>
                    <div class="card-back content-layout">
                         <!-- Icon: Sparkles/Art -->
                         <div class="card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        </div>
                        <div class="card-main-text">
                            <h3>艺术与<br>审美</h3>
                        </div>
                        <div class="card-footer-text">
                            <p>沉迷于纯粹的视觉与感性表达。</p>
                        </div>
                    </div>
                 </div>
              </div>

              <!-- Right Slice -->
              <div class="card-slot right" :style="rightCardStyle">
                 <div class="card-inner" :style="{ borderRadius: rightBorderRadius, boxShadow: dynamicShadow }">
                    <div class="card-front" :style="{ backgroundImage: `url(${bgImage})`, backgroundPosition: '100% 50%' }"></div>
                    <div class="card-back content-layout">
                         <!-- Icon: Mail/Connect -->
                         <div class="card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <div class="card-main-text">
                            <h3>灵魂<br>共鸣</h3>
                        </div>
                        <div class="card-footer-text">
                            <p>期待与同频的你相遇。</p>
                        </div>
                    </div>
                 </div>
              </div>

          </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.author-intro-scroll-container {
    height: 250vh;
    position: relative;
    z-index: 10;
}
.sticky-wrapper {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}
.stage {
    position: relative;
    width: 100%;
    max-width: 1000px;
    height: 600px;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1200px;
}

/* Text */
.fly-text {
    position: absolute;
    top: 35%; /* Center initially was 50%, raised to 35% */
    left: 50%;
    transform: translate(-50%, 0);
    text-align: center;
    color: #fff;
    z-index: 1; /* BEHIND cards (cards are z-index auto/stacking context, likely higher) */
    width: 100%;
    pointer-events: none;
    transition: filter 0.3s;
}
.fly-text h1 {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.fly-text p {
    font-size: 1.5rem;
    opacity: 0.9;
    font-weight: 300;
}

/* Cards Group */
.cards-group {
    position: relative;
    width: 280px; /* Base width of ONE card (center) */
    height: 420px;
    /* We build the image out from the center card */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10; /* ON TOP of text */
    transform-style: preserve-3d;
}

.card-slot {
    position: absolute;
    width: 280px;
    height: 420px;
    top: 0;
    left: 0;
    will-change: transform;
}

/* Center is default 0,0 */
.card-slot.center {
    z-index: 2;
}

/* Shared Inner Styles */
.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
    /* Box shadow and Border Radius handled dynamically via JS now */
}
.cards-group.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    overflow: hidden;
    /* Border Radius inheritance */
    border-radius: inherit;
}

.card-front {
    background-size: 840px 420px; /* 3x width */
    background-repeat: no-repeat;
}
.card-front::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.2));
}

/* ------------------------------------------------ */
/* REFERENCE STYLE IMPLEMENTATION (Agency Matte)     */
/* ------------------------------------------------ */

.card-back {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Icon Top, Content Center/Bottom */
    padding: 30px;
    font-family: 'Inter', sans-serif; /* Clean Sans Serif */
    transform: rotateY(180deg);
}

/* Layout Elements */
.card-icon {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding-top: 10px;
}

.card-main-text {
    flex-grow: 1;
    display: flex;
    align-items: center; /* Vertically Center Title */
    text-align: left;
}

.card-main-text h3 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0;
}

.card-footer-text {
    text-align: left;
}

.card-footer-text p {
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
    opacity: 0.8;
    font-weight: 400;
}

/* ------------------------------------------------ */
/* THEMES (Matte - Solid - High Contrast)           */
/* ------------------------------------------------ */

/* Left Card: Matte White/Gray */
.left .card-back {
    background-color: #E2E2E2; /* Matte Light Gray */
    color: #111111; /* Dark Text */
    border: 1px solid rgba(255, 255, 255, 0.4); /* Subtle rim */
    box-shadow: none;
}
.left .card-icon svg {
    stroke: #111111;
}

/* Center Card: Matte Vibrant Red */
.center .card-back {
    background-color: #D31D1D; /* Matte Red */
    color: #FFFFFF; /* White Text */
    border: 1px solid rgba(255, 255, 255, 0.15); /* Subtle rim */
    box-shadow: none;
}
.center .card-icon svg {
    stroke: #FFFFFF;
}

/* Right Card: Matte Deep Black */
.right .card-back {
    background-color: #111111; /* Matte Deep Black */
    color: #B0B0B0; /* Light Gray Text */
    border: 1px solid rgba(255, 255, 255, 0.2); /* Visible rim for separation */
    box-shadow: none;
}
.right .card-main-text h3 {
    color: #FFFFFF; /* Title White */
}
.right .card-icon svg {
    stroke: #FFFFFF;
}


@media (max-width: 768px) {
    .stage { transform: scale(0.6); }
    .author-intro-scroll-container { height: 200vh; }
}
</style>

