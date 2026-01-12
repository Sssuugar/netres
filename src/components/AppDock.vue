<template>
    <div class="app-dock-container">
        <div class="app-dock">
            <a 
                v-for="(item, index) in dockItems" 
                :key="item.name" 
                :href="item.url || '#'" 
                target="_blank" 
                :title="item.name"
                class="dock-item"
            >
                <div 
                    class="icon-wrapper" 
                    :style="{ '--hover-color': item.color }"
                >
                    <div 
                        class="icon-svg-wrapper" 
                        :class="{ 'use-original-colors': item.keepOriginalColors }"
                        v-html="item.svg" 
                        :style="{ color: item.keepOriginalColors ? undefined : item.color }"
                    ></div>
                </div>
                <span class="tooltip">{{ item.name }}</span>
            </a>
        </div>
        <div class="dock-copyright">
            &copy; 2026 Sssuugar (NetRes.cn) | 不涉及任何侵权内容，不做任何商用
        </div>
    </div>
</template>

<script setup>
import { 
    SVG_BILIBILI, SVG_DOUYIN, SVG_ZHICHU, SVG_TIEBA, 
    SVG_DOUBAO, SVG_YUANBAO, SVG_DEEPSEEK, 
    SVG_CHATGPT, SVG_GEMINI, SVG_GROK 
} from '@/js/svg-icons.js'; 

// --- Data ---
const dockItems = [
    { name: 'B站', url: 'https://www.bilibili.com', svg: SVG_BILIBILI, color: '#00a1d6' },
    { name: '抖音', url: 'https://www.douyin.com', svg: SVG_DOUYIN, color: '#FE2C55' },
    { name: '知乎', url: 'https://www.zhihu.com', svg: SVG_ZHICHU, color: '#0084FF' },
    { name: '贴吧', url: 'https://tieba.baidu.com', svg: SVG_TIEBA, color: '#0084FF' },
    { name: 'Gemini', url: 'https://gemini.google.com', svg: SVG_GEMINI, color: '#4E89FF' },
    { name: 'ChatGPT', url: 'https://chat.openai.com', svg: SVG_CHATGPT, color: '#10a37f' },
    { name: 'Grok', url: 'https://grok.com/', svg: SVG_GROK, color: '#ffffff' },
    { name: '豆包', url: 'https://www.doubao.com', svg: SVG_DOUBAO, color: '#4a90e2', keepOriginalColors: true },
    { name: '元宝', url: 'https://yuanbao.tencent.com', svg: SVG_YUANBAO, color: '#00CC71' },
    { name: 'Deepseek', url: 'https://www.deepseek.com', svg: SVG_DEEPSEEK, color: '#4D6BFE' },
];
</script>

<style scoped>
/* Container */
.app-dock-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.dock-copyright {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    pointer-events: none;
    white-space: nowrap;
}

.app-dock {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(20, 20, 20, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px 16px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

/* Dock Item */
.dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dock-item:hover {
    transform: translateY(-5px);
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.dock-item:hover .icon-wrapper {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 15px var(--hover-color, rgba(255, 255, 255, 0.2));
}

.icon-svg-wrapper {
    width: 32px;
    height: 32px;
    transition: color 0.2s;
}

.dock-item:hover .icon-svg-wrapper {
    color: #fff;
}

.icon-svg-wrapper > :deep(svg) {
    width: 100%;
    height: 100%;
}

.icon-svg-wrapper:not(.use-original-colors) > :deep(svg path) {
    fill: currentColor !important;
}

/* Tooltip */
.tooltip {
    position: absolute;
    top: -30px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s, top 0.2s;
    white-space: nowrap;
}

.dock-item:hover .tooltip {
    opacity: 1;
    top: -40px;
}
</style>
