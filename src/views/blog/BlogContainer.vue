<template>
  <div class="blog-container" :style="{ '--theme-intensity': themeIntensity }" @mousemove="handleMouseMove">
    <!-- 左侧导航引导光芒 -->
    <div v-if="!showNav" class="nav-glow-hint"></div>

    <!-- 左侧导航 -->
    <SideNav
      :navItems="navItems"
      :activeSection="activeSection"
      :showNav="showNav"
      v-model:isHovering="isHovering"
      @navClick="scrollToSection"
    />

    <!-- 右侧主要内容 -->
    <main class="main-content" :class="{ 'nav-hidden': !showNav }" @scroll="handleScroll">
      <!-- 英雄区域 -->
      <HeroSection />

      <!-- 作者介绍 -->
      <AuthorIntro />

      <!-- 特色文章 -->
      <FeaturedSection
        :featuredPosts="featuredPosts"
        @openPost="openPost"
      />

      <!-- 个人图集 -->
      <GallerySection />

      <!-- 最新文章 -->
      <ArticlesSection
        :regularPosts="regularPosts"
        @openPost="openPost"
      />

      <!-- 底部 -->
      <BlogFooter />
    </main>

    <!-- 书籍阅读模态框 -->
    <ReadingModal
      :selectedPost="selectedBook"
      @closePost="closeBook"
    />

    <!-- 文章详情模态框 -->
    <ArticleDetailModal
      :selectedArticle="selectedArticle"
      @closeArticle="closeArticle"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideNav from './components/SideNav.vue'
import HeroSection from './components/HeroSection.vue'
import AuthorIntro from './components/AuthorIntro.vue'
import FeaturedSection from './components/FeaturedSection.vue'
import GallerySection from './components/GallerySection.vue'
import ArticlesSection from './components/ArticlesSection.vue'
import ReadingModal from './components/ReadingModal.vue'
import ArticleDetailModal from './components/ArticleDetailModal.vue'
import BlogFooter from './components/BlogFooter.vue'

// 导航数据
const navItems = [
  { id: 'hero', label: '首页', icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
  { id: 'featured', label: '精选书籍', icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
  { id: 'gallery', label: '个人图集', icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
  { id: 'articles', label: '最新动态', icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' }
]

const route = useRoute()
const router = useRouter()

const activeSection = ref('hero')
const selectedBook = ref(null)
const selectedArticle = ref(null)
const scrollProgress = ref(0) // 添加滚动进度
const isHovering = ref(false) // 添加导航栏悬停状态
const mouseX = ref(1000) // 添加鼠标X坐标，初始值设为大值避免初始触发侧边栏

// 计算是否在精选区域 - 添加过渡缓冲
const isInFeaturedSection = computed(() => {
  if (activeSection.value === 'featured') return true
  if (activeSection.value === 'hero' && scrollProgress.value > 0.3) return true
  if (activeSection.value === 'articles' && scrollProgress.value < 0.7) return true
  return activeSection.value === 'featured'
})

// 计算主题强度 (0-1之间)
// 计算主题强度 (0-1之间)
const themeIntensity = ref(0) // Changed to ref for continuous update

// 计算导航栏显示状态
const showNav = computed(() => isHovering.value || mouseX.value < 50)

import newsData from '@/assets/data/news.json'
import booksData from '@/books/books.json'

// 核心数据处理逻辑：从 JSON 加载所有书籍元数据
const loadBooks = () => {
  return booksData.map(book => ({
    ...book,
    chapterCount: book.chapters || 0,
    isBook: true,
    content: '' // 内容留空，等待延迟加载
  }));
};

const dynamicBooks = loadBooks();

// 从 news.json 加载最新动态
const loadNews = () => {
  return newsData.map(news => ({
    ...news,
    isBook: false
  }));
};

const allNews = loadNews();

// 将书籍列为精选内容
const featuredPosts = computed(() => dynamicBooks);
// 普通文章列表
const regularPosts = computed(() => allNews);


// 滚动导航逻辑
const scrollToSection = (id) => {
  activeSection.value = id
  const mainContent = document.querySelector('.main-content')
  const element = document.getElementById(id)
  if (mainContent && element) {
    // 增加一个微小的偏移量 (30px)，让大标题更贴近顶部，而不是完全贴死
    const offset = id === 'hero' ? 0 : 30
    const targetScrollTop = element.offsetTop + offset
    mainContent.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  // 强制初始位置对齐，解决刷新后位置不一致的问题
  setTimeout(() => {
    scrollToSection('hero')
  }, 100)
})

const handleScroll = (e) => {
  const scrollTop = e.target.scrollTop
  const scrollHeight = e.target.scrollHeight - e.target.clientHeight

  // 计算整体滚动进度
  const progress = scrollTop / scrollHeight
  scrollProgress.value = progress

  // 计算并更新主题强度 (Sunrise Effect)
  const featuredElement = document.getElementById('featured')
  if (featuredElement) {
    const rect = featuredElement.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const center = windowHeight / 2 // Screen center
    const elementCenter = rect.top + rect.height / 2 // Element center relative to viewport top
    
    // Distance from center
    const distance = Math.abs(center - elementCenter)
    
    // Visible range for transition (e.g., 80% of screen height)
    const range = windowHeight * 0.8 
    
    // Calculate intensity: 1 at center, 0 at range limit
    // Clamp between 0 and 1
    let intensity = 1 - (distance / range)
    intensity = Math.max(0, Math.min(1, intensity))
    
    themeIntensity.value = intensity
  }

  // 调整触发阈值，让导航高亮切换得更自然
  const scrollPosition = scrollTop + 100
  const sections = ['hero', 'featured', 'gallery', 'articles']

  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const { offsetTop, offsetHeight } = element
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        activeSection.value = section
      }
    }
  }
}

// 模态框逻辑
const openPost = (post) => {
  if (post.isBook) {
    // 路由跳转
    router.push({ name: 'blog-book', params: { id: post.id } })
  } else {
    // 使用 fileName 去掉后缀作为 ID，或者使用 id
    // 为了更友好的 URL，我们尝试匹配 fileName
    const slug = post.fileName ? post.fileName.replace('.md', '') : post.id
    router.push({ name: 'blog-article', params: { id: slug } })
  }
}
const closeBook = () => {
  router.push({ name: 'blog' })
}
const closeArticle = () => {
  router.push({ name: 'blog' })
}

// SEO 优化逻辑
const updateSEO = () => {
  const metaDescription = document.querySelector('meta[name="description"]')
  
  if (selectedBook.value) {
    document.title = `${selectedBook.value.title} | NetRes 藏书馆`
    if (metaDescription) {
      metaDescription.setAttribute('content', selectedBook.value.excerpt || `阅读 ${selectedBook.value.title}`)
    }
  } else if (selectedArticle.value) {
    document.title = `${selectedArticle.value.title} | NetRes 动态`
    if (metaDescription) {
      metaDescription.setAttribute('content', selectedArticle.value.excerpt || `查看 ${selectedArticle.value.title}`)
    }
  } else {
    document.title = 'NetRes 博客 | 探索思考与技术的边界'
    if (metaDescription) {
      metaDescription.setAttribute('content', '分享关于技术、阅读与生活的深度思考。在这里，你可以找到关于 AI、编程、游戏以及社会观察的独到见解。')
    }
  }
}

// 监听路由变化处理弹窗状态
watch(() => route.params, (params) => {
  // Reset
  selectedBook.value = null
  selectedArticle.value = null

  if (route.name === 'blog-book' && params.id) {
    const book = dynamicBooks.find(b => b.id === params.id)
    if (book) {
      selectedBook.value = book
    }
  } else if (route.name === 'blog-article' && params.id) {
    // 尝试匹配 fileName (without extension) 或 id
    const article = allNews.find(n => {
      if (n.fileName && n.fileName.replace('.md', '') === params.id) return true
      return String(n.id) === String(params.id)
    })
    if (article) {
      selectedArticle.value = article
    }
  }

  updateSEO()
}, { immediate: true })

// 鼠标移动事件处理
const handleMouseMove = (e) => {
  mouseX.value = e.clientX
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* 基础容器样式 */
.blog-container {
  display: flex;
  height: 100vh;
  height: 100dvh; /* 使用动态视口高度，更好地适配Mac等设备 */
  background: linear-gradient(135deg,
    rgba(255, 165, 0, var(--theme-intensity, 0)) 0%,
    rgba(255, 140, 0, calc(var(--theme-intensity, 0) * 0.8)) 50%,
    rgba(255, 69, 0, calc(var(--theme-intensity, 0) * 0.6)) 100%),
    #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 精选区域暖色主题 */
.blog-container.featured-theme {
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b35 50%, #ff4500 100%);
  background-attachment: fixed;
  filter: brightness(1.1) saturate(1.2);
}

/* 右侧内容 */
.main-content {
  flex: 1;
  height: 100vh;
  height: 100dvh; /* 使用动态视口高度 */
  margin-left: 0;
  padding-bottom: 60px; /* 减少底部padding，让footer完整显示 */
  overflow-y: auto;
  scroll-behavior: smooth;
  position: relative;
  background: radial-gradient(circle at 50% 50%,
    rgba(26, 26, 26, calc(1 - var(--theme-intensity, 0) * 0.3)) 0%,
    rgba(0, 0, 0, calc(1 - var(--theme-intensity, 0) * 0.1)) 100%);
  transition: all 0.3s ease;
  width: 100%; /* Ensure full width */
}

/* Removed .main-content.nav-hidden as padding is no longer toggled */

.blog-container.featured-theme .main-content {
  background: radial-gradient(circle at 50% 50%, rgba(255, 140, 0, 0.1) 0%, rgba(255, 69, 0, 0.05) 100%);
  filter: brightness(1.05) saturate(1.1);
}

.section {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .blog-container {
    flex-direction: column;
  }

  .main-content {
    margin-top: 60px;
  }

  .section {
    padding: 2rem 1rem;
  }
}

/* 左侧导航引导光芒 */
.nav-glow-hint {
  position: fixed;
  left: 0;
  top: 38px;
  width: 100px;
  height: calc(100vh - 38px);
  z-index: 40;
  pointer-events: none;
  background: linear-gradient(90deg, 
    rgba(0, 122, 255, 0.2) 0%,
    rgba(138, 43, 226, 0.12) 40%,
    rgba(0, 122, 255, 0.06) 80%,
    transparent 100%);
  animation: unifiedGlow 3s ease-in-out infinite;
}

.nav-glow-hint::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100vh;
  background: linear-gradient(180deg, 
    rgba(0, 122, 255, 1) 0%, 
    rgba(138, 43, 226, 1) 30%,
    rgba(0, 122, 255, 1) 70%,
    rgba(138, 43, 226, 1) 100%);
  border-radius: 3px;
  box-shadow: 
    0 0 25px rgba(0, 122, 255, 1),
    0 0 50px rgba(0, 122, 255, 0.8),
    0 0 75px rgba(0, 122, 255, 0.6);
  animation: simplePulse 2s ease-in-out infinite;
}

@keyframes unifiedGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes simplePulse {
  0%, 20% {
    opacity: 0.8;
    box-shadow: 
      0 0 20px rgba(0, 122, 255, 0.9),
      0 0 40px rgba(0, 122, 255, 0.7),
      0 0 60px rgba(0, 122, 255, 0.5);
  }
  50% {
    opacity: 1;
    box-shadow: 
      0 0 30px rgba(0, 122, 255, 1.1),
      0 0 60px rgba(0, 122, 255, 0.9),
      0 0 90px rgba(0, 122, 255, 0.7);
  }
  80%, 100% {
    opacity: 0.8;
    box-shadow: 
      0 0 20px rgba(0, 122, 255, 0.9),
      0 0 40px rgba(0, 122, 255, 0.7),
      0 0 60px rgba(0, 122, 255, 0.5);
  }
}
</style>
```