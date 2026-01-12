<template>
  <div class="floating-text-container">
    <div 
      v-for="(item, index) in floatingWords" 
      :key="index"
      class="floating-word"
      :style="{
        top: item.top,
        left: item.left,
        animationDelay: item.delay,
        animationDuration: item.duration,
        fontSize: item.size,
        opacity: item.opacity,
        filter: `blur(${item.blur})`
      }"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  customWords: {
    type: Array,
    default: () => [
      'Musk', 'Jobs', 'Turing', 'Tesla', 'Altman', 'Nakamoto', 'Von Neumann', 'Shannon',
      'Torvalds', 'Page', 'Brin', 'Zuck', 'Huang', 'Moore', 'Curie', 'Einstein',
      'Mars', 'SpaceX', 'Neuralink', 'OpenAI', 'Apple', 'Linux', 'Bitcoin', 'Ethereum',
      'Matrix', 'Cyberpunk', 'Singularity', 'Entropy', 'Qubit', 'Synapse', 'Cortex',
      'Protocol', 'Kernel', 'Glitch', 'Proxy', 'Root', 'Sudo', 'Daemon', '42',
      '马斯克', '乔布斯', '图灵', '特斯拉', '奥特曼', '中本聪', '冯诺依曼', '香农',
      '火星', '星舰', '脑机接口', '奇点', '熵增', '三体', '流浪地球', '赛博朋克',
      '人工智能', '深度学习', '神经网络', '大模型', '元宇宙', '区块链', '比特币',
      '量子纠缠', '相对论', '事件视界', '第一性原理', '现实扭曲力场', '极客', '黑客',
      'Innovation', 'Disrupt', 'Unknown', 'Future', 'Dream', 'Logic', 'Code'
    ]
  },
  density: {
    type: Number,
    default: 1.0 // 控制文字密度
  }
})

const floatingWords = ref([])

onMounted(() => {
  // 根据密度调整数量，默认为原来的一样多，如果 density = 0.5 则减半
  const wordsToUse = props.customWords // 这里简单全用，或者可以随机取
  
  floatingWords.value = wordsToUse.map((text) => ({
    text,
    top: Math.random() * 90 + 5 + '%',
    left: Math.random() * 90 + 5 + '%',
    delay: -(Math.random() * 20) + 's',
    duration: 20 + Math.random() * 40 + 's',
    size: 0.8 + Math.random() * 1.5 + 'rem',
    opacity: 0.03 + Math.random() * 0.12,
    blur: 1 + Math.random() * 4 + 'px'
  }))
})
</script>

<style scoped>
.floating-text-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0; /* 默认层级 */
  pointer-events: none;
  background-color: #000; /* Deep universe black */
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(76, 29, 149, 0.4) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
}

.floating-word {
  position: absolute;
  white-space: nowrap;
  font-weight: 700;
  color: #fff; /* 默认白色，可通过父组件混合模式或 opacity 调整 */
  user-select: none;
  animation: float-around linear infinite;
}

@keyframes float-around {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, 50px) rotate(2deg);
  }
  66% {
    transform: translate(-20px, 30px) rotate(-2deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}
</style>
