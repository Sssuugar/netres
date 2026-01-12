// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import DbqdView from '@/views/apps/WorkbenchView.vue'
import BaibanView from '@/views/apps/WhiteboardView.vue'
import blogView from '@/views/blog/BlogContainer.vue'
import QuotationView from '@/views/apps/QuotationView.vue'
import AppsView from '@/views/AppsView.vue'
import TierListView from '@/views/apps/TierListView.vue'
import PianoView from '@/views/apps/PianoView.vue'
import ResourcesView from '@/views/apps/ResourcesView.vue'
import FocusView from '@/views/apps/FocusView.vue'
import FriendsView from '@/views/FriendsView.vue'

const router = createRouter({
  // ----------------------------------------------------------------
  // 关键修改点：将 import.meta.env.BASE_URL 替换为硬编码的根路径 '/'
  // 这将解决 "Uncaught SyntaxError: Cannot use 'import.meta' outside a module" 错误
  // ----------------------------------------------------------------
  history: createWebHistory('/'),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/apps/workbench',
      name: 'workbench',
      component: DbqdView,
      meta: {
        title: '工作台 | NetRes',
        description: '高效的任务管理与专注工具，助你井井有条。'
      }
    },
    {
      path: '/apps/whiteboard',
      name: 'whiteboard',
      component: BaibanView,
      meta: {
        title: '创意白板 | NetRes',
        description: '自由挥洒灵感，整理思绪的无限画布。'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { title: '关于 | NetRes' }
    },
    {
      path: '/apps/quotation',
      name: 'quotation',
      component: QuotationView,
      meta: {
        title: '报价单生成器 | NetRes',
        description: '快速创建专业、美观的报价单，提升商务效率。'
      }
    },
    {
      path: '/blog',
      name: 'blog',
      component: blogView
    },
    {
      path: '/blog/article/:id',
      name: 'blog-article',
      component: blogView
    },
    {
      path: '/blog/book/:id',
      name: 'blog-book',
      component: blogView
    },
    {
      path: '/apps',
      name: 'apps',
      component: AppsView,
      meta: {
        title: '应用中心 | NetRes',
        description: '探索 NetRes 的实用工具与服务'
      }
    },
    // 添加更多视图...
    {
      path: '/apps/tier-list',
      name: 'tier-list',
      component: TierListView,
      meta: {
        title: '梯级榜单 | NetRes',
        description: '创建并分享你的趣味排行榜。'
      }
    },
    {
      path: '/apps/piano',
      name: 'piano',
      component: PianoView,
      meta: {
        title: 'Mac Piano | NetRes',
        description: '享受浏览器中的音乐创作乐趣。'
      }
    },
    {
      path: '/apps/resources',
      name: 'resources',
      component: ResourcesView,
      meta: {
        title: '精选导航 | NetRes',
        description: '发现互联网上的优质资源与工具。'
      }
    },
    {
      path: '/apps/focus',
      name: 'focus',
      component: FocusView,
      meta: {
        title: '沉浸专注 | NetRes',
        description: '白噪音与雨声，助你进入心流状态。'
      }
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
      meta: {
        title: '友情链接 | NetRes',
        description: '探索我们推荐的优质网站和伙伴。'
      }
    },
  ]
})

// 全局 SEO 守卫
router.beforeEach((to, from, next) => {
  // 更新标题
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = 'NetRes'
  }

  // 更新描述
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    if (to.meta.description) {
      metaDescription.setAttribute('content', to.meta.description)
    } else {
      // 默认描述
      metaDescription.setAttribute('content', '分享关于技术、阅读与生活的深度思考。')
    }
  }

  next()
})

export default router