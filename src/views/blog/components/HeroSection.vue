<template>
  <section id="hero" class="section hero-section">
    <!-- 背景层：纯黑/微暗背景 -->
    <div class="hero-bg-layer"></div>

    <!-- 浮动文字层 (高级动物歌词) -->
    <div class="floating-text-container">
      <div 
        v-for="(item, index) in floatingWords" 
        :key="index"
        class="floating-word"
        :style="{
          top: item.top,
          left: item.left,
          animationDelay: item.delay,
          animationDuration: item.duration,
          fontSize: item.size,
          opacity: item.opacity,
          filter: `blur(${item.blur})`
        }"
      >
        {{ item.text }}
      </div>
    </div>

    <!-- 主要内容层 -->
    <div class="hero-content-layer">
      <div class="hero-container">
        
        <!-- 欢迎徽章 (Glass Capsule) - Left Aligned -->
        <div class="welcome-badge fade-in-up" style="animation-delay: 0.1s;">
          <div class="badge-inner">
            <span class="badge-dot" style="background-color: #00f2fe; box-shadow: 0 0 10px #00f2fe;"></span>
            <span class="badge-text">Sssuugar’s blog</span>
          </div>
        </div>

        <!-- 主标题 - 镂空动态特效 -->
        <div class="title-wrapper fade-in-up" style="animation-delay: 0.2s;">
          <h1 class="hero-main-title hollow-text-effect" style="letter-spacing: 0px;">
            向往<br>自由
          </h1>
        </div>

        <!-- 副标题 -->
        <h2 class="hero-sub-title fade-in-up" style="animation-delay: 0.3s;">
          Beyond rules, just for vibes.
          <br>跳出既定框架，只为那份瞬间的共鸣。
        </h2>

        <!-- 描述 -->
        <p class="hero-description fade-in-up" style="animation-delay: 0.4s;">
          这里没有预设的主题，也没有刻意的分类。
          <br>
          我只是把那些刚好击中我的、让我兴致盎然的碎片，悉数呈现在这里。
        </p>

      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const words = [
  '矛盾', '虚伪', '贪婪', '欺骗', '幻想', '疑惑', '简单', '善变',
  '好强', '无奈', '孤独', '脆弱', '忍让', '气愤', '复杂', '讨厌',
  '嫉妒', '阴险', '争夺', '埋怨', '自私', '无聊', '变态', '冒险',
  '好色', '善良', '博爱', '诡辩', '能说', '空虚', '真诚', '金钱',
  '噢 我的天', '高级动物', '地狱', '天堂', '皆在人间', '伟大', '渺小', '中庸', '可怜',
  '欢乐', '痛苦', '战争', '平安', '辉煌', '暗淡', '得意', '伤感',
  '怀恨', '报复', '专横', '责难'
]

const floatingWords = ref([])

onMounted(() => {
  floatingWords.value = words.map((text) => ({
    text,
    top: Math.random() * 90 + 5 + '%',
    left: Math.random() * 90 + 5 + '%',
    delay: -(Math.random() * 20) + 's', // 负延迟让动画立即开始在随机位置
    duration: 20 + Math.random() * 40 + 's',
    size: 0.8 + Math.random() * 1.5 + 'rem',
    opacity: 0.03 + Math.random() * 0.12,
    blur: 1 + Math.random() * 4 + 'px'
  }))
})

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>




/* ---------------------------------- */
/* 核心布局 */
/* ---------------------------------- */
.hero-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中展示，或者可以 flex-start + padding-top */
  align-items: flex-start; /* 左对齐关键 */
  padding: 0 10vw; /* 左侧留白 */
  overflow: hidden;
  background-color: #050505;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #fff;
}

.hero-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 80% 20%, rgba(20, 20, 30, 1) 0%, rgba(5, 5, 5, 1) 70%);
  z-index: 1;
}

.hero-content-layer {
  position: relative;
  z-index: 10;
  width: 100%;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 内部元素左对齐 */
  text-align: left; /* 文本左对齐 */
  max-width: 1200px;
}

/* ---------------------------------- */
/* 镂空文字特效 (Hollow Text) */
/* ---------------------------------- */
.title-wrapper {
  margin-bottom: 1.5rem;
}

.hollow-text-effect {
  font-family: 'Inter', sans-serif;
  font-size: clamp(5rem, 12vw, 10rem); /* 巨大字体 */
  font-weight: 950; /* 极粗 */
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -2px;
  margin: 0;
  transform: skewX(-3deg) rotate(-1deg); /* 增加狂野倾斜感 */
  
  /* 关键代码：背景图片裁剪到文字 */
  background-image: url('@/assets/background-image.jpg');
  background-size: 200% auto;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent; /* 文字透明 */
  
  /* 动态效果 */
  animation: move-bg 20s linear infinite alternate;
  
  /* 增加文字描边增强辨识度 */
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
}

@keyframes move-bg {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

/* ---------------------------------- */
/* 欢迎徽章 (Glass Capsule) */
/* ---------------------------------- */
.welcome-badge {
  margin-bottom: 2rem;
}

.badge-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.badge-dot {
  width: 6px;
  height: 6px;
  background-color: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 10px #4ade80;
}

.badge-text {
  font-size: 1.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Caveat', cursive;
  text-transform: none; /* 确保不强制大写，手写体小写更好看 */
}

/* ---------------------------------- */
/* 副标题与描述 */
/* ---------------------------------- */
.hero-sub-title {
  font-family: 'Dancing Script', 'STKaiti', 'Kaiti', cursive, serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 500;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2rem 0;
  letter-spacing: 0.5px;
  line-height: 1.3;
  transform: skewX(-5deg); /* 增强中文部分的斜体感 */
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.hero-description {
  font-size: 1.15rem;
  line-height: 2.2; /* 增加行高，阅读更“舒服” */
  color: rgba(255, 255, 255, 0.45); /* 稍微调暗，增加高级感 */
  max-width: 650px;
  margin: 0 0 3.5rem 0;
  font-weight: 300;
}

/* ---------------------------------- */
/* 浮动背景文字 (高级动物) */
/* ---------------------------------- */
.floating-text-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 2; /* 位于背景层之上，内容层之下 */
  pointer-events: none;
}

.floating-word {
  position: absolute;
  white-space: nowrap;
  font-weight: 700;
  color: #fff;
  user-select: none;
  animation: float-around linear infinite;
}

@keyframes float-around {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, 50px) rotate(2deg);
  }
  66% {
    transform: translate(-20px, 30px) rotate(-2deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

/* ---------------------------------- */
/* 按钮 (Premium Buttons) */
/* ---------------------------------- */
.hero-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.btn-premium {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem 2.5rem;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
}

.btn-premium.primary {
  background: #fff;
  color: #000;
  border: none;
}

.btn-premium.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(255, 255, 255, 0.3);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%);
  transform: translateX(-100%);
  transition: 0.5s;
}

.btn-premium.primary:hover .btn-glow {
  transform: translateX(100%);
  transition: 0.5s;
}

.btn-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.btn-premium.primary:hover .btn-icon {
  transform: translateX(4px);
}

.btn-premium.secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.btn-premium.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

/* ---------------------------------- */
/* 入场动画 (Entrance Animations) */
/* ---------------------------------- */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fade-in-up-anim 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fade-in-up-anim {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .hero-section {
    padding: 0 2rem;
    align-items: center; /* 手机端可能还要居中一点？或者保持左对齐看需求 */
    justify-content: center;
    padding-top: 0;
  }
  
  .hero-container {
    align-items: flex-start; /* 保持左对齐风格 */
    text-align: left;
  }

  .hollow-text-effect {
    font-size: 4rem; /* 调整手机字体 */
    line-height: 1.1;
  }
  
  .hero-sub-title {
    font-size: 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 1rem;
  }
  
  .btn-premium {
    width: 100%;
  }
}
</style>