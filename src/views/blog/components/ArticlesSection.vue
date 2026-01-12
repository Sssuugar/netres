<template>
  <section id="articles" class="section articles-section">
    <div class="content-container">
      <div class="section-header">
        <h2 class="section-title">最新动态</h2>
        <div class="section-line"></div>
      </div>
      <div class="articles-grid">
        <div v-for="post in regularPosts" :key="post.id" class="glass-card article-card" @click="openPost(post)">
          <div class="article-image-wrapper">
            <template v-if="post.coverImage">
              <img :src="post.coverImage" :alt="post.title" class="article-cover-img">
            </template>
            <template v-else>
              <div class="color-block" :style="{ background: getRandomColor(post.id + 10) }"></div>
            </template>
          </div>
          <div class="article-content">
            <div class="article-tags">
              <span v-for="tag in post.tags.slice(0,2)" :key="tag" class="tag">#{{ tag }}</span>
            </div>
            <h3 class="article-title">{{ post.title }}</h3>
            <div class="article-footer">
              <span class="article-date">{{ post.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  regularPosts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['openPost'])

const openPost = (post) => {
  emit('openPost', post)
}

const getRandomColor = (seed) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  ]
  return colors[seed % colors.length]
}
</script>

<style scoped>
.articles-section {
  display: flex;
  flex-direction: column; /* Ensure column layout */
  justify-content: flex-start; /* Align content to top */
  align-items: center; /* Center content horizontally */
  padding: 100px 2rem 2rem 2rem; /* Reduced top padding */
}

.content-container {
  width: 80%; /* Strict 80% width as requested */
  max-width: 1600px; /* Optional cap for very large screens */
  margin: 0 auto;
}

.section-header {
  text-align: left;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.section-line {
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #ff8c00, #ff4500);
  border-radius: 2px;
  margin: 0;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
  cursor: pointer;
}

.glass-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.article-image-wrapper {
  height: 180px;
  overflow: hidden;
}

.article-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.glass-card:hover .article-cover-img {
  transform: scale(1.1);
}

.color-block {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.glass-card:hover .color-block {
  transform: scale(1.1);
}

.article-content {
  padding: 1.5rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  font-size: 0.75rem;
  color: #ff8c00;
  background: rgba(255, 140, 0, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.article-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}
</style>