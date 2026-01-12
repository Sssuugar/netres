<template>
  <div class="neo-nav-fixed-content">
    <div class="background-dots"></div>

    <div class="content-wrapper">
      <header class="content-header">
        <p class="site-subtitle">精选实用导航，一键直达所需资源</p>
      </header>
      <div class="search-section">
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            @input="filterLinks"
            placeholder="输入关键词搜索导航链接，例如：Vue、GitHub、Figma..."
            class="search-input"
          />
          <i class="search-icon fas fa-search"></i>
        </div>
      </div>

      <main class="main-grid">
        <section
          v-for="category in filteredCategories"
          :key="category.name"
          class="category-card"
        >
          <h2 class="card-title">{{ category.name }}</h2>
          <ul class="link-list">
            <li v-for="link in category.links" :key="link.name">
              <a :href="link.url" target="_blank" rel="noopener noreferrer" class="nav-link-item">
                <i :class="['link-icon', link.icon || 'fas fa-link']"></i>
                <span class="link-name">{{ link.name }}</span>
              </a>
            </li>
          </ul>
        </section>

        <section v-if="filteredCategories.length === 0" class="no-results category-card">
          <h2 class="card-title">未找到结果 😟</h2>
          <p>抱歉，没有链接匹配您的关键词 **"{{ searchQuery }}"**。</p>
        </section>
      </main>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'NeoNavContent',
  setup() {
    const searchQuery = ref('');
    // 导航数据
    const categories = ref([
    {
        name: '💻 编程开发',
        links: [
            // 国内最大的开源代码托管平台
            { name: 'Gitee 码云', url: 'https://gitee.com/', icon: 'fas fa-code-branch' },
            // 国内主流开发者问答与技术社区
            { name: 'SegmentFault 思否', url: 'https://segmentfault.com/', icon: 'fas fa-fire' },
            // 综合性技术社区与博客
            { name: 'CSDN', url: 'https://www.csdn.net/', icon: 'fas fa-laptop-code' },
            // 高质量博客与知识分享社区
            { name: '掘金', url: 'https://juejin.cn/', icon: 'fas fa-compass' },
        ],
    },
    {
        name: '🎨 设计与创意',
        links: [
            // 国内 UI/UX 设计师交流与灵感社区
            { name: '站酷 ZCOOL', url: 'https://www.zcool.com.cn/', icon: 'fas fa-palette' },
            // 高质量素材与设计资源下载
            { name: '千图网', url: 'https://www.qiantu.com/', icon: 'fas fa-image' },
            // 国内专业设计师社区
            { name: '优设网', url: 'https://www.uisdc.com/', icon: 'fas fa-lightbulb' },
            // 字体与字库专业平台
            { name: '字由', url: 'https://www.hellofont.cn/', icon: 'fas fa-font' },
        ],
    },
    {
        name: '⚙️ 效率与 AI 工具',
        links: [
            // 国内核心 AI 大模型与工具集
            { name: '文心一言 ', url: 'https://yiyan.baidu.com/', icon: 'fas fa-robot' },
            // 笔记、知识与项目协作工具
            { name: '飞书', url: 'https://www.feishu.cn/', icon: 'fas fa-paper-plane' },
            // 流程图与思维导图绘制工具
            { name: 'ProcessOn', url: 'https://www.processon.com/', icon: 'fas fa-project-diagram' },
            // 常用在线工具与查询
            { name: '菜鸟工具', url: 'https://c.runoob.com/', icon: 'fas fa-toolbox' },
        ],
    },
    {
        name: '📺 影音流媒体',
        links: [
            // 长视频内容综合平台
            { name: '爱奇艺', url: 'https://www.iqiyi.com/', icon: 'fas fa-infinity' },
            // 青年文化与高质量 UP 主视频
            { name: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: 'fas fa-fire' },
            // 电影评分与文化社区
            { name: '豆瓣电影', url: 'https://movie.douban.com/', icon: 'fas fa-star-half-alt' },
            // 短视频与生活分享核心
            { name: '抖音', url: 'https://www.douyin.com/', icon: 'fas fa-mobile-alt' },
        ],
    },
    {
        name: '💡 社区与资讯',
        links: [
            // 深度问答与知识讨论社区
            { name: '知乎', url: 'https://www.zhihu.com/', icon: 'fab fa-zhihu' },
            // 综合性社区与热点讨论
            { name: '微博', url: 'https://weibo.com/', icon: 'fab fa-weibo' },
            // 兴趣社交与生活方式分享
            { name: '小红书', url: 'https://www.xiaohongshu.com/', icon: 'fas fa-heart' },
            // 游戏与泛娱乐社区
            { name: 'NGA 玩家社区', url: 'https://bbs.nga.cn/', icon: 'fas fa-users' },
        ],
    },
    {
        name: '🛒 生活与休闲',
        links: [
            // 本地生活服务与吃喝玩乐
            { name: '大众点评', url: 'https://www.dianping.com/', icon: 'fas fa-utensils' },
            // 潮流商品与交易平台
            { name: '得物', url: 'https://www.dewu.com/', icon: 'fas fa-shopping-bag' },
            // 优惠信息与购物决策
            { name: '什么值得买', url: 'https://www.smzdm.com/', icon: 'fas fa-dollar-sign' },
            // 音乐流媒体平台
            { name: '网易云音乐', url: 'https://music.163.com/', icon: 'fas fa-mobile-alt' },
        ],
    },
]);

    const filteredCategories = computed(() => {
      if (!searchQuery.value) {
        return categories.value;
      }
      const query = searchQuery.value.toLowerCase();
      return categories.value
        .map((category) => {
          const filteredLinks = category.links.filter(
            (link) =>
              link.name.toLowerCase().includes(query) ||
              link.url.toLowerCase().includes(query)
          );
          return {
            ...category,
            links: filteredLinks,
          };
        })
        .filter((category) => category.links.length > 0);
    });

    const filterLinks = () => {
      // 触发 computed 属性更新
    };
    
    onMounted(() => {
        // 确保 Font Awesome 图标库已加载
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(link);
    });

    return {
      searchQuery,
      filteredCategories,
      filterLinks,
    };
  }
};
</script>

<style scoped lang="scss">
// --- 颜色和尺寸变量 (macOS Dark Mode Style) ---
$mac-bg-color: #1c1c20; // 整体深色背景
$mac-glass-color: rgba(45, 45, 55, 0.55); // 磨砂玻璃色
$mac-glass-color-hover: rgba(55, 55, 65, 0.7); // 悬停时的磨砂玻璃色
$mac-border-color: rgba(255, 255, 255, 0.1);
$mac-text-color: #f0f0f5;
$mac-accent-color: #007aff; // 蓝色强调色 (macOS Blue)
$mac-radius: 12px;
$mac-card-radius: 18px;
$mac-shadow-heavy: 0 10px 30px rgba(0, 0, 0, 0.4);
$mac-shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1), 0 6px 15px rgba(0, 0, 0, 0.3);

// ----------------------------------
// 1. 关键修正：使用 fixed 定位实现全屏
// ----------------------------------
.neo-nav-fixed-content {
  // 模仿你的 AboutPage 的定位方式
  position: fixed;
  top: 34px; // 假设你的顶部工具栏高度是 34px
  left: 0;
  right: 0;
  bottom: 0; // 假设底部无Dock栏，或Dock栏在更下方的层级
  
  background-color: $mac-bg-color; // 提供一个基础的深色背景
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  color: $mac-text-color;
  overflow-y: auto; // 允许内容滚动
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

// ----------------------------------
// 2. 背景点阵 (模仿 AboutPage)
// ----------------------------------
.background-dots {
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: dotMove 100s linear infinite;
  opacity: 0.3;
  z-index: -1;
}
@keyframes dotMove {
  from { background-position: 0 0; }
  to { background-position: 100% 100%; }
}

// ----------------------------------
// 3. 内容包装器 (Content Wrapper)
// ----------------------------------
.content-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px; 
  box-sizing: border-box; 
}


// --- 顶部标题 ---
.content-header {
  text-align: center;
  margin-bottom: 40px;
}

.site-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 5px;
  background: linear-gradient(90deg, #53a8ff, $mac-accent-color, #3affff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.site-subtitle {
    font-size: 1rem;
    color: rgba($mac-text-color, 0.7);
}

// --- 搜索栏 ---
.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 700px;
}

.search-input {
  width: 100%;
  padding: 18px 50px 18px 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: $mac-radius;
  background-color: $mac-glass-color;
  color: $mac-text-color;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  
  // 磨砂玻璃效果
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  box-shadow: $mac-shadow-light;

  &::placeholder {
    color: rgba($mac-text-color, 0.5);
  }

  &:focus {
    background-color: rgba(45, 45, 55, 0.7);
    border-color: $mac-accent-color;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3), $mac-shadow-light;
  }
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba($mac-text-color, 0.5);
  font-size: 1.3rem;
}

// --- 主内容网格 ---
.main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.category-card, .no-results {
  background-color: $mac-glass-color;
  border: 1px solid $mac-border-color;
  border-radius: $mac-card-radius;
  padding: 25px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: $mac-shadow-heavy;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
  }
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba($mac-border-color, 0.5);
  color: $mac-text-color;
}

.link-list {
  list-style: none;
  padding: 0;
}

.link-list li {
  margin-bottom: 5px;
}

.nav-link-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 10px;
  text-decoration: none;
  color: $mac-text-color;
  background-color: transparent;
  transition: all 0.25s ease;
  font-weight: 400;
  font-size: 1.05rem;

  &:hover {
    background-color: $mac-glass-color-hover;
    color: $mac-accent-color;
    transform: translateX(5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

    .link-name {
        font-weight: 600;
    }
  }
}

.link-icon {
  font-size: 1.1rem;
  width: 25px;
  text-align: center;
  margin-right: 15px;
  color: rgba($mac-text-color, 0.7);
  transition: color 0.25s ease;

  .nav-link-item:hover & {
    color: $mac-accent-color;
  }
}

// 适应小屏幕
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 20px;
  }
  .site-title {
    font-size: 2.5rem;
  }
  .search-input {
    padding: 15px 40px 15px 20px;
    font-size: 1rem;
  }
  .main-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>