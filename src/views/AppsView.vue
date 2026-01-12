<template>
  <div class="apps-portal">
    <div class="hero-bg"></div>
    <div class="content-wrapper">
      
      <!-- Apps Grid -->
      <div class="apps-grid fade-in-up">
        <router-link 
          v-for="app in apps" 
          :key="app.id" 
          :to="app.path" 
          class="app-card"
        >
          <div class="card-glass">
            
            <div class="card-main">
              <!-- Icons removed as requested -->
              <div class="info-group">
                <h3>{{ app.name }}</h3>
                <p>{{ app.desc }}</p>
              </div>
            </div>

            <div class="card-footer">
              <span class="app-id">#{{ app.id.toUpperCase().substring(0, 3) }}</span>
              <div class="card-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const apps = [
  {
    id: 'workbench',
    name: '工作台',
    desc: '高效的任务管理与专注工具',
    path: '/apps/workbench'
  },
  {
    id: 'quotation',
    name: '报价单',
    desc: '生成专业商务报价单',
    path: '/apps/quotation'
  },
  {
    id: 'whiteboard',
    name: '创意白板',
    desc: '无限画布，自由挥洒灵感',
    path: '/apps/whiteboard'
  },
  {
    id: 'tier-list',
    name: '从夯到拉',
    desc: '趣味等级排行制作',
    path: '/apps/tier-list'
  },
  {
    id: 'piano',
    name: 'Mac Piano',
    desc: '在线钢琴演奏与创作',
    path: '/apps/piano'
  },
  {
    id: 'resources',
    name: '精选导航',
    desc: '优质资源与工具集合',
    path: '/apps/resources'
  },
  {
    id: 'focus',
    name: '沉浸专注',
    desc: '白噪音与雨声，助你进入心流状态',
    path: '/apps/focus'
  }
]

onMounted(() => {
  document.title = '应用中心 | NetRes'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');

.apps-portal {
  min-height: 100vh;
  position: relative;
  background-color: #0f172a;
  color: white;
  font-family: 'Noto Sans SC', sans-serif;
  overflow-x: hidden;
  padding-top: 80px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 70%);
  z-index: 0;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* Card Design */
.app-card {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card-glass {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
}

.app-card:hover .card-glass {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

/* Internal Layout */
.card-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1; /* Allow content to push footer down */
}

/* Typography adjustments for text-only card */
.info-group h3 {
  font-size: 1.5rem; /* Increased size since it's the main visual now */
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.info-group p {
  font-size: 0.95rem; /* Slightly larger readability */
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer Section */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
  margin-top: 20px;
}

.app-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #475569;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

.card-arrow {
  color: #64748b;
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.app-card:hover .card-arrow {
  color: #f1f5f9;
  transform: translateX(4px) rotate(-45deg);
}

/* Animation */
.fade-in-up {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
}
</style>
