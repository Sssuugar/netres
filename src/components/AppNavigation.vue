<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// ==========================================
// 🔧 Menu Configuration
// ==========================================
const menuConfig = ref([
  {
    title: '邮箱', 
    groups: [    
      {
        title: '个人常用', 
        items: [
          { name: 'QQ 邮箱', url: 'https://mail.qq.com' },
          { name: '网易 163', url: 'https://mail.163.com' },
          { name: 'Gmail', url: 'https://mail.google.com' }
        ]
      },
      {
        title: '热门推荐',
        items: [
          { name: 'Outlook', url: 'https://outlook.live.com' },
          { name: '新浪邮箱', url: 'https://mail.sina.com.cn' },
          { name: '阿里邮箱', url: 'https://mail.aliyun.com' }
        ]
      }
    ]
  },
  {
    title: '云服务',
    groups: [
      {
        title: '核心大厂',
        items: [
          { name: 'Cloudflare', url: 'https://dash.cloudflare.com' },
          { name: '阿里云', url: 'https://www.aliyun.com' },
          { name: '腾讯云', url: 'https://cloud.tencent.com' },
          { name: '华为云', url: 'https://www.huaweicloud.com' }
        ]
      },
      {
        title: '存储与智能',
        items: [
          { name: '七牛云', url: 'https://www.qiniu.com' },
          { name: '百度智能云', url: 'https://cloud.baidu.com' },
          { name: '又拍云', url: 'https://www.upyun.com' }
        ]
      },
      {
        title: '国外优选',
        items: [
          { name: 'Cloudcone', url: 'https://cloudcone.com' }
        ]
      }
    ]
  },
  {
    title: '开发设计',
    groups: [
      {
        title: '代码托管',
        items: [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'Gitee', url: 'https://gitee.com' },
          { name: 'GitLab', url: 'https://gitlab.com' }
        ]
      },
      {
        title: '设计资源',
        items: [
          { name: 'iconfont', url: 'https://www.iconfont.cn' },
          { name: '花瓣网', url: 'https://huaban.com' }
        ]
      }
    ]
  }
]);

// --- Menu Interaction Logic ---
const activeMenuIndex = ref(null);
let menuTimer = null;

const handleMenuEnter = (index) => {
  if (menuTimer) clearTimeout(menuTimer);
  activeMenuIndex.value = index;
};

const handleMenuLeave = () => {
  menuTimer = setTimeout(() => {
    activeMenuIndex.value = null;
  }, 200);
};

// --- Time Logic ---
const currentTime = ref('');
const updateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[now.getDay()];
  
  // Format: 2026年01月06日 21:30 周二
  currentTime.value = `${year}年${month}月${day}日 ${hours}:${minutes} ${weekDay}`;
};
import { onMounted, onUnmounted } from 'vue';
let timer = null;
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (menuTimer) clearTimeout(menuTimer);
});
</script>

<template>
  <nav class="app-navigation">
    <div class="nav-left">
      <span class="brand-logo">NetRes</span>
      
      <div 
        v-for="(menu, index) in menuConfig" 
        :key="index"
        class="menu-item-wrapper" 
        @mouseenter="handleMenuEnter(index)" 
        @mouseleave="handleMenuLeave"
      >
        <span class="menu-item">
          {{ menu.title }}
        </span>
        
        <transition name="fade-slide">
          <div v-if="activeMenuIndex === index" class="dropdown-menu">
            <div v-for="(group, gIndex) in menu.groups" :key="gIndex">
              <div v-if="group.title" class="group-title">{{ group.title }}</div>
              
              <a 
                v-for="(item, iIndex) in group.items" 
                :key="iIndex"
                :href="item.url" 
                target="_blank" 
                class="dropdown-link"
              >
                {{ item.name }}
              </a>

              <div v-if="gIndex < menu.groups.length - 1" class="divider"></div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="nav-center">
      <RouterLink to="/" active-class="active">主页</RouterLink>
      <RouterLink to="/blog" active-class="active">博客</RouterLink>
      <RouterLink to="/apps" active-class="active">应用</RouterLink>
      <RouterLink to="/friends" active-class="active">友链</RouterLink>

    </div>

    <div class="nav-right">
      <span class="clock">{{ currentTime }}</span>
    </div>
  </nav>
</template>

<style scoped>
.app-navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  padding: 0 24px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Inter', sans-serif;
  color: #eee;
}

/* Left: Brand & Menus */
.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-logo {
  font-weight: 700;
  font-size: 1.1rem;
  color: #fff;
  letter-spacing: 0.5px;
}

.menu-item-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.menu-item {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* Dropdown */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  width: 160px;
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.group-title {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  padding: 4px 10px;
  text-transform: uppercase;
  font-weight: 600;
}

.dropdown-link {
  display: block;
  padding: 6px 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.dropdown-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 6px 0;
}

/* Center: Navigation Links */
.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.nav-center a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.2s;
}

.nav-center a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-center a.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 500;
}

/* Right: Clock */
.clock {
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
