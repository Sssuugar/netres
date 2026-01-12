<template>
  <div class="friends-portal">
    <div class="background-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
    
    <div class="content-wrapper">
      <div class="header-section fade-in-down">
        <h1>友情链接</h1>
        <p class="subtitle">探索更多精彩的世界</p>
      </div>
      
      <!-- Friends Grid -->
      <div class="friends-grid fade-in-up">
        <a 
          v-for="(friend, index) in friends" 
          :key="friend.id" 
          :href="friend.url" 
          target="_blank"
          class="friend-card"
          :style="{ '--delay': `${index * 0.1}s`, '--accent-color': friend.color }"
        >
          <div class="card-glass">
            <div class="glow-effect"></div>
            
            <div class="card-main">
              <div class="info-group">
                <h3>{{ friend.name }}</h3>
                <p>{{ friend.desc }}</p>
              </div>
            </div>

            <div class="card-footer">
              <span class="friend-id">#{{ friend.id.toUpperCase().substring(0, 3) }}</span>
              <div class="card-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const friends = [
  {
    id: 'dragon-fruit',
    name: 'Dragon Fruit Blog',
    desc: '一个有趣的个人博客，记录生活与技术。',
    url: 'https://www.83go.com/',
    color: '#ff4d4d' // Red
  },
]

onMounted(() => {
  document.title = '友情链接 | NetRes'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');

.friends-portal {
  min-height: 100vh;
  position: relative;
  background-color: #050511;
  color: white;
  font-family: 'Noto Sans SC', sans-serif;
  overflow-x: hidden;
  padding-top: 100px;
  padding-bottom: 60px;
}

/* Background Blobs */
.background-blobs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: blob-float 10s infinite alternate ease-in-out;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #7c3aed;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 600px;
  height: 600px;
  background: #2563eb;
  bottom: -150px;
  right: -150px;
  animation-delay: -2s;
}

.blob-3 {
  width: 400px;
  height: 400px;
  background: #db2777;
  top: 40%;
  left: 30%;
  opacity: 0.4;
  animation-delay: -4s;
}

@keyframes blob-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.header-section {
  margin-bottom: 60px;
  text-align: left;
}

.header-section h1 {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
}

.subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  font-weight: 400;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

/* Card Design */
.friend-card {
  text-decoration: none;
  color: inherit;
  display: block;
  animation: fadeIn 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
  opacity: 0; /* Initally hidden for animation */
}

.card-glass {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

/* Colorful Glow/Border effect */
.card-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  opacity: 0.8;
}

.friend-card:hover .card-glass::before {
  transform: translateX(100%);
}

.glow-effect {
  position: absolute;
  width: 150px;
  height: 150px;
  background: var(--accent-color);
  filter: blur(60px);
  opacity: 0;
  top: -50px;
  right: -50px;
  border-radius: 50%;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.friend-card:hover .glow-effect {
  opacity: 0.25;
}

.friend-card:hover .card-glass {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}

/* Content */
.card-main {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  z-index: 2;
}

.info-group h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.info-group p {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 20px;
  margin-top: auto;
  position: relative;
  z-index: 2;
}

.friend-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--accent-color);
  letter-spacing: 0.05em;
  opacity: 0.8;
  font-weight: 600;
}

.card-arrow {
  color: #64748b;
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.friend-card:hover .card-arrow {
  color: #fff;
  background: var(--accent-color);
  transform: rotate(-45deg);
}

/* Animations */
.fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .header-section h1 {
    font-size: 2.5rem;
  }
  
  .blob {
    opacity: 0.4;
  }
}
</style>
