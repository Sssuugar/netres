<template>
  <transition name="deep-fade">
    <div class="focus-fullscreen-overlay">
      
      <div ref="canvasRef" class="webgl-layer"></div>

      <div class="hud-layer">
        
        <div class="hud-top">
          <div class="status-pill">
            <span class="pulse-beacon"></span>
            <span>DEEP WORK MODE</span>
          </div>
          <h1 class="task-title" :data-text="taskName">{{ taskName }}</h1>
        </div>

        <div class="hud-center">
          <div class="timer-wrapper">
            <span class="timer-digit">{{ formattedTime }}</span>
          </div>
          <div class="progress-text">
            SYNC RATE: {{ Math.floor(progress) }}%
          </div>
        </div>

        <div class="hud-bottom">
          <button @click="handleCancel" class="cyber-btn secondary">
            <span class="btn-content">ABORT // 放弃</span>
            <div class="btn-bg"></div>
          </button>
          
          <button @click="handleComplete" class="cyber-btn primary">
            <span class="btn-content">COMPLETE // 完成</span>
            <div class="btn-bg"></div>
          </button>
        </div>

      </div>

      <div class="noise-overlay"></div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import * as THREE from 'three';

// === Props & Emits ===
const props = defineProps({
  taskName: { type: String, default: '未命名任务' },
  duration: { type: Number, default: 25 * 60 } // 秒
});

const emit = defineEmits(['cancel', 'complete']);

// === Vue Logic ===
const canvasRef = ref(null);
const timeLeft = ref(props.duration);
const progress = computed(() => ((props.duration - timeLeft.value) / props.duration) * 100);

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0');
  const s = (timeLeft.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

let timerInterval = null;

// === Three.js Variables ===
let scene, camera, renderer;
let stars, coreMesh, ringMesh;
let mouseX = 0, mouseY = 0;
let animationId;

// === Three.js Logic ===
const initThree = () => {
  // 1. Scene Setup
  scene = new THREE.Scene();
  // 增加迷雾，让远处粒子淡出，营造深邃感
  scene.fog = new THREE.FogExp2(0x050505, 0.002);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasRef.value.appendChild(renderer.domElement);

  // 4. Object: Starfield (粒子星空)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 3000;
  const posArray = new Float32Array(starCount * 3);
  const colorArray = new Float32Array(starCount * 3);

  for(let i = 0; i < starCount * 3; i+=3) {
    // 随机分布 XYZ
    posArray[i] = (Math.random() - 0.5) * 200; 
    posArray[i+1] = (Math.random() - 0.5) * 200;
    posArray[i+2] = (Math.random() - 0.5) * 200;

    // 颜色随机：青色、白色、紫色混合
    const colorType = Math.random();
    if(colorType > 0.8) { // 紫
      colorArray[i] = 0.8; colorArray[i+1] = 0.4; colorArray[i+2] = 1.0;
    } else if (colorType > 0.5) { // 青
      colorArray[i] = 0.0; colorArray[i+1] = 1.0; colorArray[i+2] = 1.0;
    } else { // 白
      colorArray[i] = 1.0; colorArray[i+1] = 1.0; colorArray[i+2] = 1.0;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // 5. Object: The Core (能量核心)
  const coreGeo = new THREE.IcosahedronGeometry(5, 1); // 二十面体
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x0044aa, // 自发光
    shininess: 100,
    flatShading: true
  });
  coreMesh = new THREE.Mesh(coreGeo, coreMat);
  scene.add(coreMesh);

  // 6. Object: Energy Ring (外围线框)
  const ringGeo = new THREE.TorusGeometry(9, 0.2, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    transparent: true,
    opacity: 0.3,
    wireframe: true
  });
  ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  scene.add(ringMesh);

  // 7. Lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00ffff, 2, 50);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
  pointLight2.position.set(-10, -10, 10);
  scene.add(pointLight2);

  animate();
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  const time = Date.now() * 0.0005;

  // 1. 粒子旋转
  stars.rotation.y = time * 0.1;
  stars.rotation.x = time * 0.05;

  // 2. 核心呼吸与变形
  const breath = 1 + Math.sin(time * 3) * 0.1; // 呼吸效果
  coreMesh.scale.set(breath, breath, breath);
  coreMesh.rotation.y += 0.01;
  coreMesh.rotation.z += 0.005;

  // 3. 环的运动
  ringMesh.rotation.z -= 0.005;
  ringMesh.rotation.x = Math.sin(time) * 0.2 + (Math.PI / 2);

  // 4. 鼠标视差 (Parallax Effect)
  // 让相机根据鼠标位置轻微移动，制造空间感
  camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  // 5. 颜色随进度变化
  // 随着时间流逝，核心变得更红/金
  const p = progress.value / 100;
  if (p > 0.8) {
     coreMesh.material.emissive.setHex(0xffaa00); // 金色冲刺
  } else {
     coreMesh.material.emissive.setHSL(0.6 - p * 0.4, 1, 0.5); // 蓝 -> 紫
  }

  renderer.render(scene, camera);
};

// === Event Handlers ===
const onMouseMove = (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
};

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const handleCancel = () => {
  emit('cancel');
};

const handleComplete = () => {
  emit('complete');
};

// === Lifecycle ===
onMounted(() => {
  initThree();
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    }
  }, 1000);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);
  clearInterval(timerInterval);
  
  if (renderer) {
    renderer.dispose();
    // 简单的内存清理
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
});
</script>

<style scoped>
/* 引入酷炫字体 */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');

/* === 核心容器：强行全屏，最高层级 === */
.focus-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #050505; /* 深空黑 */
  z-index: 99999; /* 确保盖住一切 */
  overflow: hidden;
  font-family: 'Rajdhani', sans-serif;
  color: #fff;
}

/* ThreeJS 画布 */
.webgl-layer {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1;
}

/* 噪点遮罩 (增加电影质感) */
.noise-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 2;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* === HUD UI === */
.hud-layer {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  background: radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%);
}

/* 顶部 */
.hud-top {
  text-align: center;
  margin-top: 20px;
  animation: slideDown 0.8s ease-out;
}

.status-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  letter-spacing: 3px;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.pulse-beacon {
  width: 8px; height: 8px; background: #00ffff; border-radius: 50%;
  box-shadow: 0 0 8px #00ffff;
  animation: pulse 2s infinite;
}

.task-title {
  margin-top: 15px;
  font-family: 'Orbitron', sans-serif;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: linear-gradient(to bottom, #fff, #aaa);
  -webkit-background-clip: text;
  color: transparent;
}

/* 中部计时器 */
.hud-center {
  text-align: center;
  position: relative;
  animation: fadeIn 1s ease-out;
}

.timer-wrapper {
  position: relative;
  display: inline-block;
}

.timer-digit {
  font-family: 'Orbitron', sans-serif;
  font-size: 10vw; /* 响应式巨大字体 */
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  letter-spacing: -5px;
  line-height: 1;
}

.progress-text {
  margin-top: 10px;
  font-size: 1.2rem;
  letter-spacing: 5px;
  color: rgba(255, 255, 255, 0.6);
}

/* 底部按钮 */
.hud-bottom {
  display: flex; gap: 40px;
  margin-bottom: 40px;
  animation: slideUp 0.8s ease-out;
}

.cyber-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 15px 40px;
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  color: #fff;
  letter-spacing: 2px;
  overflow: hidden;
  transition: 0.3s;
}

/* 按钮背景特效 */
.cyber-btn .btn-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  transform: skewX(-20deg);
  border: 1px solid rgba(255,255,255,0.2);
  transition: 0.3s;
}

.cyber-btn .btn-content {
  position: relative; z-index: 1;
}

.cyber-btn:hover .btn-bg {
  background: rgba(255,255,255,0.1);
  box-shadow: 0 0 20px rgba(255,255,255,0.1);
  border-color: #fff;
}

.cyber-btn.primary .btn-bg {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.05);
}

.cyber-btn.primary:hover .btn-bg {
  background: #00ffff;
  box-shadow: 0 0 30px #00ffff;
}
.cyber-btn.primary:hover .btn-content {
  color: #000;
  font-weight: bold;
}

.cyber-btn.secondary .btn-bg {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.05);
}

.cyber-btn.secondary:hover .btn-bg {
  background: #ff4444;
  box-shadow: 0 0 30px #ff4444;
}

/* 动画定义 */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.5); opacity: 0.5; }
}

@keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

/* 进场退场过渡 */
.deep-fade-enter-active, .deep-fade-leave-active { transition: opacity 1s ease; }
.deep-fade-enter-from, .deep-fade-leave-to { opacity: 0; }
</style>