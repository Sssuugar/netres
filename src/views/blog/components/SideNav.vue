<template>
  <nav class="side-nav" :class="{ 'visible': showNav }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="nav-brand">

      <span class="brand-text">
        Sssuugar的博客
      </span>
    </div>
    <ul class="nav-menu">
      <li v-for="(item, index) in navItems" :key="index"
          :class="{ active: activeSection === item.id }"
          @click="$emit('navClick', item.id)">
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ item.label }}</span>
      </li>
    </ul>
    <div class="nav-footer">
      <p>© 2024 BLOG</p>
    </div>
  </nav>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  navItems: {
    type: Array,
    required: true
  },
  activeSection: {
    type: String,
    required: true
  },
  showNav: {
    type: Boolean,
    default: false
  },
  isHovering: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:isHovering', 'navClick'])

const handleMouseEnter = () => {
  emit('update:isHovering', true)
}

const handleMouseLeave = () => {
  emit('update:isHovering', false)
}
</script>

<style scoped>
.side-nav {
  width: 260px;
  height: calc(100vh - 38px);
  top: 38px;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: 2rem;
  z-index: 100;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
}

.side-nav.visible {
  transform: translateX(0);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.nav-menu li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.nav-menu li:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-menu li.active {
  background: #007aff;
  color: #fff;
}

.nav-footer {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .side-nav {
    width: 100%;
    height: auto;
    padding: 1rem;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
  }

  .nav-menu {
    flex-direction: row;
    justify-content: flex-end;
  }

  .nav-label, .nav-footer, .nav-brand {
    display: none;
  }

  .nav-menu li {
    padding: 0.5rem;
  }
}
</style>