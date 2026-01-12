# NetRes分享 - 博客模块化重构

## 项目结构

```
src/views/blog/
├── BlogContainer.vue          # 主容器组件
└── components/
    ├── MouseTrail.vue         # 鼠标轨迹效果
    ├── SideNav.vue           # 左侧导航栏
    ├── HeroSection.vue       # 英雄区域（首页）
    ├── FeaturedSection.vue   # 特色文章区域
    ├── ArticlesSection.vue   # 最新文章区域
    ├── ReadingModal.vue      # 文章阅读模态框
    └── BlogFooter.vue        # 底部信息
```

## 组件说明

### BlogContainer.vue
- **功能**: 主容器组件，管理整体布局和状态
- **职责**:
  - 管理导航状态 (activeSection)
  - 处理文章选择状态 (selectedPost)
  - 协调各子组件之间的通信
  - 包含博客数据和业务逻辑

### MouseTrail.vue
- **功能**: Canvas鼠标轨迹效果
- **特性**: 彩色粒子跟随鼠标移动

### SideNav.vue
- **功能**: 左侧导航栏
- **特性**: 响应式设计，平滑滚动导航

### HeroSection.vue
- **功能**: 首页英雄区域
- **特性**:
  - 3D深度效果
  - 统计卡片
  - 作者信息卡片
  - 技能标签
  - 滚动提示

### FeaturedSection.vue & ArticlesSection.vue
- **功能**: 文章展示区域
- **特性**: 玻璃态效果，悬停动画

### ReadingModal.vue
- **功能**: 文章阅读模态框
- **特性**: 全屏阅读体验

### BlogFooter.vue
- **功能**: 底部版权信息

## 技术栈

- **Vue 3**: Composition API
- **CSS**: 现代特性 (backdrop-filter, transform3d, clamp())
- **HTML5 Canvas**: 鼠标轨迹效果
- **响应式设计**: 移动端适配

## 设计特色

1. **现代化UI**: 玻璃态效果、3D深度、渐变色彩
2. **流畅动画**: 平滑过渡、悬停效果
3. **响应式布局**: 桌面和移动端优化
4. **性能优化**: 组件化架构，按需加载

## 开发说明

- 所有组件使用Vue 3 Composition API
- 样式采用scoped CSS，避免样式冲突
- 组件间通信通过props和emit实现
- 支持热重载开发