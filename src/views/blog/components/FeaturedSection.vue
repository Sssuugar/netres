<template>
  <section id="featured" class="section featured-section">
    <div class="section-header">
      <div class="title-wrapper">
        <h2 class="section-title">精选书籍</h2>
        <div class="section-underline"></div>
      </div>
      <p class="section-subtitle">沉浸式阅读，发现每一页的精彩</p>
    </div>

    <div class="featured-grid">
      <div 
        v-for="post in featuredPosts" 
        :key="post.id" 
        class="book-card" 
        @click="openPost(post)"
      >
        <div class="book-card-header">
          <span class="book-badge">{{ post.category }}</span>
          <h3 class="book-title">{{ post.title }}</h3>
        </div>

        <div class="book-card-body">
          <p class="book-excerpt">{{ post.excerpt }}</p>
        </div>

        <div class="book-card-footer">
          <div class="footer-meta">
            <span class="meta-date">{{ post.date }}</span>
            <span class="meta-chapters">{{ post.chapterCount }} 章节</span>
          </div>
          <div class="read-action">
            <span>开始阅读</span>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  featuredPosts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['openPost'])

const openPost = (post) => {
  emit('openPost', post)
}
</script>

<style scoped>
.featured-section {
  padding: 140px 5% 100px 5%;
  position: relative;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.05) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.title-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.section-title {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.section-underline {
  height: 4px;
  width: 60px;
  background: #8b5cf6;
  margin: 10px auto;
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
}

.section-subtitle {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.4);
  max-width: 600px;
  margin: 0 auto;
}

/* 核心网格布局 */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* 现代感书籍卡片设计 */
.book-card {
  position: relative;
  height: 320px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 36px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-12px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}

.book-card-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.book-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.book-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.book-card-body {
  position: relative;
  z-index: 1;
  flex: 1;
}

.book-excerpt {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}

.book-card-footer {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-date {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.3);
}

.meta-chapters {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.read-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b5cf6;
  font-weight: 700;
  font-size: 0.95rem;
  transition: transform 0.3s ease;
}

.book-card:hover .read-action {
  transform: translateX(5px);
}

@media (max-width: 900px) {
  .featured-grid {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }
  .book-card {
    height: auto;
    min-height: 280px;
  }
}
</style>