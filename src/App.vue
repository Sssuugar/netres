<script setup>
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import AppDock from './components/AppDock.vue'

</script>

<template>
  <AppNavigation />

  <main class="main-content-area">
    <RouterView v-slot="{ Component }">
      <component :is="Component" class="router-view-content" />
    </RouterView>
  </main>

  <AppDock />
</template>

<style>
/* 全局样式重置 */
html, body {
  height: 100%; 
  overflow: hidden; 
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #000000; /* Deep black for universe theme */
  color: #ffffff;
  margin: 0;
  padding: 0;
}

/* 主容器样式 */
.main-content-area {
  height: 100vh; 
  width: 100%; 
  max-width: 100%; 

  box-sizing: border-box; 
  padding-top: 50px; /* Adjust for new Nav height */
 
  position: relative; 
  overflow: hidden; 
}

.router-view-content {
  width: 100%;
  height: 100%;
  overflow: auto; 
  box-sizing: border-box;
}

/* Custom Scrollbar - Dark Theme */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>