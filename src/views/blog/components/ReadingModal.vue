<template>
  <transition name="modal-fade">
    <div v-if="selectedPost" class="reading-modal" @click.self="closePost">
      <div class="reader-container">
        <!-- 侧边栏：仅保留目录导航，保持经典深色风格 -->
        <aside class="reader-sidebar">
          <div class="book-info-brief">
            <span class="small-category">{{ selectedPost.category }}</span>
            <h2>{{ selectedPost.title }}</h2>
          </div>

          <div class="reader-chapters">
            <h3>目录</h3>
            <nav class="chapter-list">
              <div 
                v-for="(chapter, index) in chapters" 
                :key="index"
                class="chapter-item"
                :class="{ 'active': activeChapter === chapter.id }"
                @click="scrollToChapter(chapter.id)"
              >
                <span class="chap-name">{{ chapter.title }}</span>
              </div>
            </nav>
          </div>
        </aside>

        <!-- 主阅读区：背景变色仅作用于此区域 -->
        <main class="reader-main" :class="'theme-' + activeTheme">
          <!-- 悬浮阅读设置面板 -->
          <div class="reader-floating-controls">
            <div class="control-group">
              <button class="control-btn" @click="changeFontSize(-1)" title="减小字号">A-</button>
              <span class="font-indicator">{{ fontSize }}</span>
              <button class="control-btn" @click="changeFontSize(1)" title="增大字号">A+</button>
            </div>
            <div class="divider"></div>
            <div class="theme-swatch-group">
              <button 
                v-for="theme in themes" 
                :key="theme.id" 
                class="theme-swatch"
                :class="{ active: activeTheme === theme.id }"
                :style="{ backgroundColor: theme.bg }"
                :title="theme.name"
                @click="setTheme(theme.id)"
              ></button>
            </div>
          </div>

          <button class="reader-close" @click="closePost">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div class="reader-scroll-area" ref="scrollContainer" @scroll="onScroll">
            <article class="reader-article">
              <header class="article-header">
                <div class="article-meta">
                  <span class="category-tag">{{ selectedPost.category }}</span>
                  <span class="dot"></span>
                  <span>{{ selectedPost.date }}</span>
                </div>
                <h1 class="article-title">{{ selectedPost.title }}</h1>
                <div class="title-divider"></div>
              </header>
              
              <div class="article-content-wrapper">
                <div v-if="isLoading" class="reader-loading">
                  <div class="loading-spinner"></div>
                  <p>正在装载核心资料...</p>
                </div>
                <div 
                  v-else
                  class="article-content serif-font" 
                  :style="{ fontSize: fontSize + 'px' }"
                  v-html="renderedContent"
                ></div>
              </div>
              
              <footer class="article-footer">
                <div class="footer-end">- THE END -</div>
              </footer>
            </article>
          </div>
          
          <!-- 阅读进度条 -->
          <div class="reading-progress">
            <div class="progress-bar" :style="{ width: readingProgress + '%' }"></div>
          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  selectedPost: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['closePost'])

const activeChapter = ref('')
const readingProgress = ref(0)
const scrollContainer = ref(null)
const activeTheme = ref('sepia') // 默认怀旧色
const fontSize = ref(18) // 默认字号
const isLoading = ref(false)
const bookContent = ref('')

// 主题配置
const themes = [
  { id: 'paper', name: '纸张', bg: '#fdf6e3', color: '#5f633a' },
  { id: 'sepia', name: '怀旧', bg: '#f4ecd8', color: '#5b4636' },
  { id: 'eye', name: '护眼', bg: '#e8f5e9', color: '#2e7d32' },
  { id: 'dark', name: '深色', bg: '#1a1a1a', color: '#d1d1d1' }
]

const setTheme = (themeId) => {
  activeTheme.value = themeId
}

const changeFontSize = (delta) => {
  const newSize = fontSize.value + delta
  if (newSize >= 12 && newSize <= 32) {
    fontSize.value = newSize
  }
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 为标题添加 ID 插件逻辑 (所有标题都保留 ID 以便未来扩展，但目录只显示 H2)
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const nextToken = tokens[idx + 1]
  const title = nextToken.children.reduce((acc, t) => acc + t.content, '')
  const id = `chapter-${title.replace(/\s+/g, '-').toLowerCase()}`
  return `<${token.tag} id="${id}">`
}

// 提取章节 (仅提取 H2 级别的标题)
const chapters = computed(() => {
  if (!bookContent.value) return []
  
  const content = bookContent.value
  const headingRegex = /^(##)\s+(.*)$/gm // 仅匹配 ##
  const matches = []
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    matches.push({
      level: match[1].length,
      title: match[2].trim(),
      id: `chapter-${match[2].trim().replace(/\s+/g, '-').toLowerCase()}`
    })
  }
  return matches
})

const renderedContent = computed(() => {
  if (!bookContent.value) return ''
  return md.render(bookContent.value)
})

const scrollToChapter = (id) => {
  const element = document.getElementById(id)
  if (element && scrollContainer.value) {
    activeChapter.value = id
    
    // 使用手动滚动计算代替 scrollIntoView，防止页面整体上移
    const container = scrollContainer.value
    const elementTop = element.getBoundingClientRect().top
    const containerTop = container.getBoundingClientRect().top
    // 20px 作为顶部缓冲
    const targetScrollTop = container.scrollTop + elementTop - containerTop - 20
    
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }
}

const onScroll = () => {
  if (!scrollContainer.value) return

  const container = scrollContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight - container.clientHeight
  
  // 更新进度
  readingProgress.value = (scrollTop / scrollHeight) * 100

  // 更新活动章节
  const chapters_elements = chapters.value.map(c => document.getElementById(c.id)).filter(Boolean)
  for (let i = chapters_elements.length - 1; i >= 0; i--) {
    const el = chapters_elements[i]
    if (el.offsetTop <= scrollTop + 100) {
      activeChapter.value = el.id
      break
    }
  }
}

const closePost = () => {
  emit('closePost')
}

// 重置状态与加载内容
watch(() => props.selectedPost, async (newVal) => {
  if (newVal) {
    activeChapter.value = ''
    readingProgress.value = 0
    bookContent.value = ''
    
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
    }

    if (newVal.isBook && newVal.fileName) {
      isLoading.value = true
      try {
        const response = await fetch(`${process.env.BASE_URL || '/'}books/${newVal.fileName}`)
        let raw = await response.text()
        // 去除 Frontmatter
        bookContent.value = raw.replace(/^---[\s\S]*?---/, '').trim()
      } catch (e) {
        console.error('Failed to load book content:', e)
        bookContent.value = '内容加载失败，请稍后重试。'
      } finally {
        isLoading.value = false
      }
    } else {
      bookContent.value = newVal.content || ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Noto+Serif+SC:wght@400;700&display=swap');

.reading-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.reader-container {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background: #1a1a1a; /* 固定深色背景 */
  border-radius: 24px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.6);
  position: relative;
}

/* 侧边栏样式 - 保持专业深色状态 */
.reader-sidebar {
  width: 280px;
  height: 100%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  color: #fff;
}

.book-info-brief {
  margin-bottom: 3rem;
}

.small-category {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
  display: block;
}

.book-info-brief h2 {
  font-size: 1.4rem;
  line-height: 1.3;
  font-family: 'Noto Serif SC', serif;
  margin: 0;
}

.reader-chapters {
  flex: 1;
}

.reader-chapters h3 {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chapter-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.chapter-item {
  padding: 1.2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.chapter-item:hover, .chapter-item.active {
  opacity: 1;
  transform: translateX(5px);
}

.chapter-item.active .chap-name {
  color: #8b5cf6;
}

.chap-name {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

/* 主内容区样式 */
.reader-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background-color 0.4s ease, color 0.4s ease;
  overflow: hidden;
}

/* 主题颜色应用 */
.reader-main.theme-paper { background-color: #fdf6e3; color: #444; }
.reader-main.theme-sepia { background-color: #f4ecd8; color: #5b4636; }
.reader-main.theme-eye { background-color: #e8f5e9; color: #2e7d32; }
.reader-main.theme-dark { background-color: #222; color: #d1d1d1; }

/* 悬浮控制面板 (Glassmorphism) */
.reader-floating-controls {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  padding: 0 1.2rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.theme-dark .reader-floating-controls {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  color: inherit;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.theme-dark .control-btn { border-color: rgba(255, 255, 255, 0.2); }

.control-btn:hover {
  background: #8b5cf6;
  color: #fff;
  border-color: #8b5cf6;
}

.font-indicator {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
}

.theme-dark .divider { background: rgba(255, 255, 255, 0.1); }

.theme-swatch-group {
  display: flex;
  gap: 8px;
}

.theme-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.1);
}

.theme-swatch.active {
  border-color: #8b5cf6;
  transform: scale(1.15);
}

.reader-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(0,0,0,0.05);
  border: none;
  color: inherit;
  cursor: pointer;
  z-index: 100;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.reader-close:hover {
  background: #ff4d4d;
  color: #fff;
  transform: rotate(90deg);
}

.reader-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 6rem 8rem;
  scroll-behavior: smooth;
}

.reader-article {
  max-width: 750px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 5rem;
  text-align: center;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.9rem;
  opacity: 0.6;
  margin-bottom: 2rem;
}

.category-tag {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
}

.dot {
  width: 5px;
  height: 5px;
  background: currentColor;
  opacity: 0.3;
  border-radius: 50%;
}

.article-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 2.5rem;
  color: inherit;
}

.title-divider {
  width: 60px;
  height: 3px;
  background: #8b5cf6;
  margin: 0 auto;
}

.article-content {
  line-height: 2.2;
}

.serif-font {
  font-family: 'Noto Serif SC', 'Crimson Pro', serif;
}

.article-content :deep(h2) {
  font-size: 2.2rem;
  margin-top: 5rem;
  margin-bottom: 2rem;
  font-family: 'Noto Serif SC', serif;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 1rem;
}

.theme-dark .article-content :deep(h2) {
  border-bottom-color: rgba(255,255,255,0.05);
}

.article-content :deep(h3) {
  font-size: 1.6rem;
  margin-top: 3.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Noto Serif SC', serif;
}

.article-content :deep(p) {
  margin-bottom: 2.5rem;
  text-align: justify;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #8b5cf6;
  padding-left: 1.5rem;
  margin: 3rem 0;
  font-style: italic;
  opacity: 0.8;
}

.footer-end {
  text-align: center;
  margin-top: 8rem;
  padding-bottom: 6rem;
  letter-spacing: 0.8em;
  opacity: 0.3;
  font-size: 0.9rem;
  font-weight: 300;
}

/* 阅读进度条 */
.reading-progress {
  height: 6px;
  background: rgba(0,0,0,0.05);
  width: 100%;
}

.theme-dark .reading-progress { background: rgba(255,255,255,0.05); }

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  width: 0%;
  transition: width 0.1s ease-out;
}

/* 响应式 */
@media (max-width: 1024px) {
  .reader-sidebar {
    width: 260px;
  }
  .reader-scroll-area {
    padding: 5rem 4rem;
  }
}

@media (max-width: 768px) {
  .reader-sidebar {
    display: none;
  }
  .reader-floating-controls {
    top: auto;
    bottom: 2rem;
    padding: 0 1rem;
    gap: 0.8rem;
  }
  .reader-scroll-area {
    padding: 4rem 2rem;
  }
  .article-title {
    font-size: 2.5rem;
  }
  .article-content {
    font-size: 1.2rem;
  }
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(30px);
}

/* 响应式 */
@media (max-width: 1024px) {
  .reader-sidebar {
    width: 260px;
  }
  .reader-scroll-area {
    padding: 5rem 4rem;
  }
}

@media (max-width: 768px) {
  .reader-sidebar {
    display: none;
  }
  .reader-scroll-area {
    padding: 4rem 2rem;
  }
  .article-title {
    font-size: 2.5rem;
  }
  .article-content {
    font-size: 1.2rem;
  }
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(30px);
}
/* 加载状态样式 */
.reader-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  gap: 1.5rem;
  opacity: 0.7;
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

.article-content-wrapper {
  min-height: 400px;
}
</style>
