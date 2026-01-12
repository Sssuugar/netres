<template>
  <transition name="article-fade">
    <div v-if="selectedArticle" class="article-modal" @click.self="closeArticle">
      <div class="article-container" ref="scrollContainer" @scroll="onScroll">
        <!-- Close Button -->
        <button class="modal-close-btn" @click="closeArticle">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Hero Header Section -->
        <header class="article-hero">
          <div class="hero-bg" :style="{ background: heroGradient }"></div>
          <div class="hero-content">
            <div class="article-meta fade-in-up">
              <span class="category-badge">{{ selectedArticle.category }}</span>
              <span class="separator">/</span>
              <span class="date-text">{{ selectedArticle.date }}</span>
            </div>
            <h1 class="article-title fade-in-up" style="animation-delay: 0.1s;">{{ selectedArticle.title }}</h1>
            <div class="article-tags fade-in-up" style="animation-delay: 0.2s;">
              <span v-for="tag in selectedArticle.tags" :key="tag" class="tag-pill"># {{ tag }}</span>
            </div>
          </div>
          <!-- Scroll Down Hint -->
          <div class="scroll-hint fade-in" style="animation-delay: 1s;">
            <div class="mouse"></div>
            <span>往下探索</span>
          </div>
        </header>

        <!-- Main Content Section -->
        <div class="article-body">
          <div v-if="isLoading" class="article-loading">
            <div class="loading-spinner"></div>
            <p>正在装载核心内容...</p>
          </div>
          <article 
            v-else
            class="markdown-content" 
            v-html="renderedContent"
          ></article>
          
          <footer class="article-footer">
            <div class="end-marker">
              <div class="line"></div>
              <span class="end-text">FIN</span>
              <div class="line"></div>
            </div>
            <p class="copyright">本文由 Sssuugar 发布，转载请遵循创意共享协议。</p>
          </footer>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  selectedArticle: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['closeArticle'])

const scrollContainer = ref(null)
const scrollProgress = ref(0)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const articleContent = ref('')
const isLoading = ref(false)

const renderedContent = computed(() => {
  if (articleContent.value) {
    return md.render(articleContent.value)
  }
  if (!props.selectedArticle) return ''
  // Fallback for initial state or if fetch fails
  const content = props.selectedArticle.content || `<p class="excerpt-lead">${props.selectedArticle.excerpt}</p>`
  return md.render(content)
})

const heroGradient = computed(() => {
  const seed = props.selectedArticle ? props.selectedArticle.id : 0
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #d8b4fe 100%)'
  ]
  return colors[seed % colors.length]
})

const onScroll = () => {
  if (!scrollContainer.value) return
  const container = scrollContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight - container.clientHeight
  scrollProgress.value = (scrollTop / scrollHeight) * 100
}

const closeArticle = () => {
  emit('closeArticle')
}

watch(() => props.selectedArticle, async (newVal) => {
  if (newVal) {
    scrollProgress.value = 0
    articleContent.value = ''
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
    }

    if (newVal.fileName) {
      isLoading.value = true
      try {
        const response = await fetch(`${process.env.BASE_URL || '/'}news/${newVal.fileName}`)
        if (!response.ok) throw new Error('Failed to load')
        articleContent.value = await response.text()
      } catch (e) {
        console.error('Failed to load article:', e)
        articleContent.value = '内容加载失败，请重试。'
      } finally {
        isLoading.value = false
      }
    } else {
      articleContent.value = newVal.content || ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');

.article-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(30px);
  z-index: 2500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.article-container {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* Close Button */
.modal-close-btn {
  position: fixed;
  top: 30px;
  right: 40px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.modal-close-btn:hover {
  background: #fff;
  color: #000;
  transform: rotate(90deg) scale(1.1);
}

/* Hero Section */
.article-hero {
  height: 70vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 10%;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  filter: blur(80px);
  transform: scale(1.2);
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.category-badge {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  padding: 4px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.date-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.article-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1.15;
  color: #fff;
  margin-bottom: 30px;
  text-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.tag-pill {
  display: inline-block;
  margin: 0 8px;
  padding: 6px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

/* Scroll Hint */
.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  letter-spacing: 2px;
}

.mouse {
  width: 24px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  position: relative;
}

.mouse::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  width: 4px;
  height: 8px;
  background: #fff;
  border-radius: 2px;
  transform: translateX(-50%);
  animation: scrollWheel 2s infinite;
}

@keyframes scrollWheel {
  0% { transform: translate(-50%, 0); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translate(-50%, 15px); opacity: 0; }
}

/* Article Body */
.article-body {
  max-width: 850px;
  margin: 0 auto;
  padding: 80px 40px;
  background: #000;
  position: relative;
  z-index: 20;
}

.markdown-content {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 1.15rem;
  line-height: 2;
  color: rgba(255, 255, 255, 0.85);
}

.markdown-content :deep(p) { margin-bottom: 2.5rem; }

.markdown-content :deep(h2) {
  font-size: 2.4rem;
  font-weight: 800;
  color: #fff;
  margin-top: 5rem;
  margin-bottom: 2rem;
  letter-spacing: -1px;
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 16px;
  margin: 3rem 0;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

.markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(.excerpt-lead) {
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  border-left: 4px solid #8b5cf6;
  padding-left: 2rem;
  margin-bottom: 4rem;
}

/* Footer */
.article-footer {
  margin-top: 10rem;
  text-align: center;
  padding-bottom: 4rem;
}

.end-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.end-marker .line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  max-width: 100px;
}

.end-text {
  font-weight: 900;
  letter-spacing: 5px;
  color: rgba(255, 255, 255, 0.2);
}

.copyright {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Progress Bar */
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  z-index: 3000;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #8b5cf6, #00f2fe);
  width: 0;
  transition: width 0.1s linear;
}

/* Animations */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease forwards;
}

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.article-fade-enter-active,
.article-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.article-fade-enter-from,
.article-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .modal-close-btn { top: 20px; right: 20px; width: 44px; height: 44px; }
  .article-hero { height: 60vh; padding: 0 5%; }
  .article-title { font-size: 2.2rem; }
  .article-body { padding: 40px 20px; }
  .markdown-content { font-size: 1.05rem; }
}

/* Loading Styles */
.article-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 20px;
  color: rgba(255, 255, 255, 0.4);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.1);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
