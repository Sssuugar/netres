<template>
  <section id="gallery" class="section gallery-section">
    <div class="content-container">
      <!-- 头部 -->
      <div class="section-header">
        <div class="header-content">
          <div class="header-titles">
            <h2 class="section-title">{{ selectedAlbum ? selectedAlbum.title : '个人图集' }}</h2>
            <div class="section-line"></div>
          </div>
          <!-- 返回按钮 (仅详情页显示) -->
          <button v-if="selectedAlbum" class="back-btn" @click="closeAlbum">
            <span class="back-icon">←</span> 返回图集列表
          </button>
        </div>
      </div>
      
      <!-- 1. 图集列表视图 -->
      <div v-if="!selectedAlbum" class="album-list">
        <div v-for="album in albums" :key="album.id" class="album-card glass-card" @click="openAlbum(album)">
          <div class="album-cover-wrapper">
            <img :src="album.cover" :alt="album.title" class="album-cover">
            <div class="album-overlay">
              <div class="album-info-top">
                <span class="album-id">ALBM_{{ album.id.toString().padStart(2, '0') }}</span>
                <span class="album-count">{{ album.count }}P</span>
              </div>
              <h3 class="album-title">{{ album.title }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 图集详情视图 -->
      <div v-else class="album-detail">
        <div class="detail-grid">
          <div v-for="imgObj in currentImages" :key="imgObj.id" class="gallery-item glass-card small" @click="showPreview(imgObj.url)">
            <div class="image-wrapper">
              <img :src="imgObj.url" :alt="'landscape-' + imgObj.id" class="gallery-image" loading="lazy">
              <div class="tech-overlay">
                <span class="tech-id">FILE_{{ imgObj.id.toString().padStart(4, '0') }}</span>
                <div class="scan-line"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部翻页控制 -->
        <div class="gallery-pagination">
          <button class="nav-btn" :disabled="selectedAlbum.id === 1" @click="prevAlbum">
            <span class="btn-text">PREV ALBUM</span>
          </button>
          <div class="page-indicator">
            <span class="current">{{ selectedAlbum.id }}</span> / <span class="total">5</span>
          </div>
          <button class="nav-btn" :disabled="selectedAlbum.id === 5" @click="nextAlbum">
            <span class="btn-text">NEXT ALBUM</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. 全屏预览 Modal -->
    <Transition name="fade">
      <div v-if="previewUrl" class="lightbox-overlay" @click="closePreview">
        <div class="lightbox-content" @click.stop>
          <img :src="previewUrl" class="lightbox-image" alt="Full Image" referrerpolicy="no-referrer">
          
          <!-- 图片切换按钮 -->
          <button class="nav-arrow prev" @click="prevImage" title="上一张">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="nav-arrow next" @click="nextImage" title="下一张">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          <button class="close-lightbox" @click="closePreview">×</button>
          <div class="lightbox-scanline"></div>
          <div class="lightbox-info">
            {{ currentImageIndex + 1 }} / {{ currentImages.length }}
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import galleryData from '@/assets/data/gallery.json'

const selectedAlbum = ref(null)
const previewUrl = ref(null)

const albums = ref(galleryData.map(album => ({
  ...album,
  count: album.images.length
})))

// 计算当前选下图集的图片列表
const currentImages = computed(() => {
  if (!selectedAlbum.value) return []
  return selectedAlbum.value.images
})

const openAlbum = (album) => {
  selectedAlbum.value = album
  // 保持平滑滚动到图集详情
  setTimeout(() => {
    const el = document.getElementById('gallery')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const closeAlbum = () => {
  selectedAlbum.value = null
}

const nextAlbum = () => {
  const currentIndex = albums.value.findIndex(a => a.id === selectedAlbum.value.id)
  if (currentIndex < albums.value.length - 1) {
    selectedAlbum.value = albums.value[currentIndex + 1]
    const el = document.getElementById('gallery')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

const prevAlbum = () => {
  const currentIndex = albums.value.findIndex(a => a.id === selectedAlbum.value.id)
  if (currentIndex > 0) {
    selectedAlbum.value = albums.value[currentIndex - 1]
    const el = document.getElementById('gallery')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

const showPreview = (url) => {
  previewUrl.value = url
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewUrl.value = null
  document.body.style.overflow = ''
}

// 图片索引与切换逻辑
const currentImageIndex = computed(() => {
  if (!previewUrl.value || !currentImages.value) return -1
  return currentImages.value.findIndex(img => img.url === previewUrl.value)
})

const nextImage = () => {
  if (currentImageIndex.value < currentImages.value.length - 1) {
    previewUrl.value = currentImages.value[currentImageIndex.value + 1].url
  } else {
    // 循环到第一张
    previewUrl.value = currentImages.value[0].url
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    previewUrl.value = currentImages.value[currentImageIndex.value - 1].url
  } else {
    // 循环到最后一张
    previewUrl.value = currentImages.value[currentImages.value.length - 1].url
  }
}

// 键盘支持
const handleKeyDown = (e) => {
  if (e.key === 'Escape') closePreview()
  if (previewUrl.value) {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.gallery-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 100px 2rem 2rem 2rem;
  min-height: 100vh;
}

.content-container {
  width: 80%;
  max-width: 1600px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 3rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section-line {
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(79, 172, 254, 0.5);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #00f2fe;
  color: #00f2fe;
}

/* 列表视图 */
.album-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.album-card {
  aspect-ratio: 3/4;
  cursor: pointer;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateZ(0); /* Enable GPU acceleration */
  will-change: transform;
}

.album-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 242, 254, 0.2);
}

.album-cover-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.album-card:hover .album-cover {
  transform: scale(1.1);
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
}

.album-info-top {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

.album-title {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* 详情视图 */
.album-detail {
  padding-bottom: 4rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.image-wrapper {
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
  will-change: transform;
  backface-visibility: hidden;
}

.tech-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.gallery-item:hover .tech-overlay {
  opacity: 1;
}

.tech-id {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: #00f2fe;
}

/* 翻页控制 */
.gallery-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-top: 2rem;
}

.nav-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  letter-spacing: 1px;
}

.nav-btn:hover:not(:disabled) {
  border-color: #00f2fe;
  color: #00f2fe;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-indicator .current {
  color: #00f2fe;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.8);
  animation: scan 3s linear infinite;
  opacity: 0.5;
  pointer-events: none;
  will-change: transform;
  transform: translateZ(0); /* Enable GPU acceleration */
}

@keyframes scan {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(400px); opacity: 0; }
}

/* Lightbox Styles */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: zoom-out;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
  border-radius: 4px;
}

.close-lightbox {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: #fff;
  font-size: 40px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-lightbox:hover {
  color: #00f2fe;
}

.lightbox-scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 242, 254, 0.05) 50%, transparent);
  height: 100%;
  pointer-events: none;
  animation: scan 4s linear infinite;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  backdrop-filter: blur(5px);
}

.nav-arrow:hover {
  background: rgba(0, 242, 254, 0.2);
  border-color: #00f2fe;
  color: #00f2fe;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
}

.nav-arrow.prev { left: -80px; }
.nav-arrow.next { right: -80px; }

.lightbox-info {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .nav-arrow.prev { left: 10px; }
  .nav-arrow.next { right: 10px; }
  .nav-arrow {
    width: 44px;
    height: 44px;
    background: rgba(0, 0, 0, 0.4);
  }
}

@media (max-width: 768px) {
  .content-container {
    width: 95%;
  }
  .album-title {
    font-size: 1.4rem;
  }
  .close-lightbox {
    top: 10px;
    right: 10px;
  }
}
</style>
