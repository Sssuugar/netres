// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue')
    },
    {
      path: '/apps/workbench',
      name: 'workbench',
      component: () => import(/* webpackChunkName: "workbench" */ '@/views/apps/WorkbenchView.vue'),
      meta: {
        title: '工作台 | NetRes',
        description: '高效的任务管理与专注工具，助你井井有条。'
      }
    },
    {
      path: '/apps/whiteboard',
      name: 'whiteboard',
      component: () => import(/* webpackChunkName: "whiteboard" */ '@/views/apps/WhiteboardView.vue'),
      meta: {
        title: '创意白板 | NetRes',
        description: '自由挥洒灵感，整理思绪的无限画布。'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
      meta: { title: '关于 | NetRes' }
    },
    {
      path: '/apps/quotation',
      name: 'quotation',
      component: () => import(/* webpackChunkName: "quotation" */ '@/views/apps/QuotationView.vue'),
      meta: {
        title: '报价单生成器 | NetRes',
        description: '快速创建专业、美观的报价单，提升商务效率。'
      }
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import(/* webpackChunkName: "blog" */ '@/views/blog/BlogContainer.vue')
    },
    {
      path: '/blog/article/:id',
      name: 'blog-article',
      component: () => import(/* webpackChunkName: "blog-article" */ '@/views/blog/BlogContainer.vue')
    },
    {
      path: '/blog/book/:id',
      name: 'blog-book',
      component: () => import(/* webpackChunkName: "blog-book" */ '@/views/blog/BlogContainer.vue')
    },
    {
      path: '/apps',
      name: 'apps',
      component: () => import(/* webpackChunkName: "apps" */ '@/views/AppsView.vue'),
      meta: {
        title: '应用中心 | NetRes',
        description: '探索 NetRes 的实用工具与服务'
      }
    },
    // 添加更多视图...
    {
      path: '/apps/tier-list',
      name: 'tier-list',
      component: () => import(/* webpackChunkName: "tier-list" */ '@/views/apps/TierListView.vue'),
      meta: {
        title: '梯级榜单 | NetRes',
        description: '创建并分享你的趣味排行榜。'
      }
    },
    {
      path: '/apps/piano',
      name: 'piano',
      component: () => import(/* webpackChunkName: "piano" */ '@/views/apps/PianoView.vue'),
      meta: {
        title: 'Mac Piano | NetRes',
        description: '享受浏览器中的音乐创作乐趣。'
      }
    },
    {
      path: '/apps/resources',
      name: 'resources',
      component: () => import(/* webpackChunkName: "resources" */ '@/views/apps/ResourcesView.vue'),
      meta: {
        title: '精选导航 | NetRes',
        description: '发现互联网上的优质资源与工具。'
      }
    },
    {
      path: '/apps/focus',
      name: 'focus',
      component: () => import(/* webpackChunkName: "focus" */ '@/views/apps/FocusView.vue'),
      meta: {
        title: '沉浸专注 | NetRes',
        description: '白噪音与雨声，助你进入心流状态。'
      }
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import(/* webpackChunkName: "friends" */ '@/views/FriendsView.vue'),
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