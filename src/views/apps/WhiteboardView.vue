<template>
  <div class="whiteboard-wrapper">
    
    <div class="wb-toolbar">
      <div class="tool-group">
        <button class="tool-btn" :class="{ active: mode === 'draw' }" @click="setMode('draw')">
          <span class="icon">✏️</span><span class="label">画笔</span>
        </button>
        <button class="tool-btn" :class="{ active: mode === 'eraser' }" @click="setMode('eraser')">
          <span class="icon">🧹</span><span class="label">橡皮</span>
        </button>
        <div class="divider"></div>
        <button class="tool-btn" :class="{ active: mode === 'sticker' }" @click="addSticker">
          <span class="icon">📝</span><span class="label">贴纸</span>
        </button>
        <button class="tool-btn" :class="{ active: mode === 'cut' }" @click="setMode('cut')">
          <span class="icon">✂️</span><span class="label">剪线</span>
        </button>
      </div>
      <div class="actions">
        <button class="tool-btn danger" @click="clearCanvas">
          <span class="icon">🗑️</span><span class="label">清空</span>
        </button>
      </div>
    </div>

    <div class="board-area" ref="containerRef">
      
      <canvas 
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
      ></canvas>

      <div 
        v-for="sticker in stickers" 
        :key="sticker.id"
        class="sticker"
        :class="{ 'is-dragging': draggingSticker?.id === sticker.id }"
        :style="{ left: sticker.x + 'px', top: sticker.y + 'px', backgroundColor: sticker.color }"
        @mousedown.stop="startDragSticker($event, sticker)"
      >
        <div 
          class="rivet"
          :class="{ 'highlight': hoverRivetId === sticker.id }"
          @mousedown.stop="startConnecting($event, sticker)"
          @mouseenter="hoverRivetId = sticker.id"
          @mouseleave="hoverRivetId = null"
          title="拖拽连线"
        ></div>
        
        <textarea 
          v-model="sticker.text" 
          placeholder="输入..." 
          @mousedown.stop
          @input="saveData" 
        ></textarea>
        
        <div class="delete-btn" @click.stop="removeSticker(sticker.id)">×</div>
      </div>

      <svg class="svg-layer" :class="{ 'cut-mode': mode === 'cut' }">
        <defs>
          <filter id="yarn-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
            <feOffset in="blur" dx="2" dy="3" result="offsetBlur"/>
            <feFlood flood-color="rgba(0,0,0,0.3)" result="colorBlur"/>
            <feComposite in="colorBlur" in2="offsetBlur" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        
        <g v-for="link in links" :key="link.id" class="link-group" filter="url(#yarn-shadow)" @click="cutLink(link)">
          <line stroke="transparent" stroke-width="20" :x1="getStickerPos(link.from).x" :y1="getStickerPos(link.from).y" :x2="getStickerPos(link.to).x" :y2="getStickerPos(link.to).y"/>
          <line stroke="#b71c1c" stroke-width="6" stroke-linecap="round" class="visible-line-base" :x1="getStickerPos(link.from).x" :y1="getStickerPos(link.from).y" :x2="getStickerPos(link.to).x" :y2="getStickerPos(link.to).y"/>
          <line stroke="#ef5350" stroke-width="4" stroke-dasharray="4,3" stroke-linecap="round" class="visible-line-top" :x1="getStickerPos(link.from).x" :y1="getStickerPos(link.from).y" :x2="getStickerPos(link.to).x" :y2="getStickerPos(link.to).y"/>
        </g>

        <g v-if="isConnecting && tempLine.start && tempLine.end">
          <line stroke="#1890ff" stroke-width="3" stroke-dasharray="5,5" stroke-linecap="round" opacity="0.6" :x1="tempLine.start.x" :y1="tempLine.start.y" :x2="tempLine.end.x" :y2="tempLine.end.y"/>
        </g>
      </svg>

      <div class="trash-can" ref="trashRef" :class="{ 'active': isHoveringTrash }">
        <div class="trash-icon">🗑️</div>
        <div class="trash-label">拖入删除</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';

const STORAGE_KEY = 'my_whiteboard_data_v1';

const containerRef = ref(null);
const canvasRef = ref(null);
const trashRef = ref(null);

const width = ref(1000);
const height = ref(800);

const mode = ref('draw'); 
const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);

const stickers = reactive([]); 
const links = reactive([]);

const draggingSticker = ref(null);
const dragOffset = reactive({ x: 0, y: 0 });
const isHoveringTrash = ref(false);

const isConnecting = ref(false);
const hoverRivetId = ref(null);
const connectingStartId = ref(null);
const tempLine = reactive({ start: null, end: null });

// --- 持久化核心逻辑 ---
const saveData = () => {
  if (!canvasRef.value) return;
  const data = {
    stickers: stickers,
    links: links,
    canvasImage: canvasRef.value.toDataURL() 
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage 可能已满或被禁用', e);
  }
};

const loadData = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // 默认数据
    stickers.push(
      { id: 1, x: 100, y: 150, text: '刷新页面\n我也还在！', color: '#fff9c4' },
      { id: 2, x: 400, y: 150, text: '尝试画点东西\n然后F5刷新', color: '#e1f5fe' }
    );
    return;
  }

  try {
    const data = JSON.parse(raw);
    if (data.stickers) stickers.splice(0, stickers.length, ...data.stickers);
    if (data.links) links.splice(0, links.length, ...data.links);
    
    // 恢复画布图片
    if (data.canvasImage) {
      const img = new Image();
      img.src = data.canvasImage;
      img.onload = () => {
        const ctx = canvasRef.value.getContext('2d');
        // 只有当图片加载完成后，才画上去
        ctx.drawImage(img, 0, 0);
      };
    }
  } catch (e) {
    console.error('读取存档失败', e);
  }
};

// --- 初始化与尺寸管理 ---
onMounted(async () => {
  await nextTick();
  
  // 【关键修复】：
  // 必须确保 initCanvasSize 执行完毕（设置了宽高，清空了画布）
  // 然后再去执行 loadData（把图片画上去）
  // 放在同一个 setTimeout 里按顺序执行最稳妥
  setTimeout(() => {
    initCanvasSize();
    loadData();
  }, 50);

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', onGlobalMouseMove);
  window.addEventListener('mouseup', onGlobalMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', onGlobalMouseMove);
  window.removeEventListener('mouseup', onGlobalMouseUp);
});

const handleResize = () => {
  // 尺寸变化前先把内容存下来，因为重置尺寸会清空画布
  const savedData = canvasRef.value.toDataURL();
  
  initCanvasSize();
  
  const img = new Image();
  img.src = savedData;
  img.onload = () => {
    const ctx = canvasRef.value.getContext('2d');
    ctx.drawImage(img, 0, 0);
  };
};

const initCanvasSize = () => {
  if (containerRef.value && canvasRef.value) {
    width.value = containerRef.value.clientWidth;
    height.value = containerRef.value.clientHeight;
    
    // 设置宽高会重置 Canvas 内容
    canvasRef.value.width = width.value;
    canvasRef.value.height = height.value;
    
    const ctx = canvasRef.value.getContext('2d');
    ctx.lineCap = 'round'; 
    ctx.lineJoin = 'round';
  }
};

const setMode = (m) => { mode.value = m; };

// --- 剪线 ---
const cutLink = (link) => {
  if (mode.value !== 'cut') return;
  const idx = links.findIndex(l => l.id === link.id);
  if (idx !== -1) {
    links.splice(idx, 1);
    saveData();
  }
};

// --- 绘画 ---
const startDrawing = (e) => {
  if (mode.value !== 'draw' && mode.value !== 'eraser') return;
  isDrawing.value = true;
  [lastX.value, lastY.value] = [e.offsetX, e.offsetY];
};

const draw = (e) => {
  if (!isDrawing.value) return;
  const ctx = canvasRef.value.getContext('2d');
  ctx.beginPath(); ctx.moveTo(lastX.value, lastY.value); ctx.lineTo(e.offsetX, e.offsetY);
  if (mode.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 30;
  } else {
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
  }
  ctx.stroke();
  [lastX.value, lastY.value] = [e.offsetX, e.offsetY];
};
const stopDrawing = () => { 
  if (isDrawing.value) {
    isDrawing.value = false;
    saveData();
  }
};
const clearCanvas = () => {
  if(confirm('清空画板？')) {
    canvasRef.value.getContext('2d').clearRect(0, 0, width.value, height.value);
    stickers.splice(0); links.splice(0);
    saveData();
  }
};

// --- 贴纸 ---
const addSticker = () => {
  const colors = ['#fff9c4', '#ffccbc', '#d1c4e9', '#c8e6c9', '#b3e5fc'];
  stickers.push({ 
    id: Date.now(), 
    x: width.value / 2 - 80, 
    y: height.value / 2 - 60, 
    text: '', 
    color: colors[Math.floor(Math.random()*colors.length)] 
  });
  mode.value = null; 
  saveData();
};
const removeSticker = (id) => {
  const idx = stickers.findIndex(s => s.id === id);
  if (idx !== -1) stickers.splice(idx, 1);
  for (let i = links.length - 1; i >= 0; i--) { 
    if (links[i].from === id || links[i].to === id) links.splice(i, 1); 
  }
  saveData();
};

const startDragSticker = (e, sticker) => {
  if (isConnecting.value) return; 
  draggingSticker.value = sticker;
  const rect = containerRef.value.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left - sticker.x;
  dragOffset.y = e.clientY - rect.top - sticker.y;
};

// --- 连线逻辑 ---
const startConnecting = (e, sticker) => {
  if (mode.value === 'cut') return;
  isConnecting.value = true;
  connectingStartId.value = sticker.id;
  const startPos = getStickerPos(sticker.id);
  tempLine.start = { x: startPos.x, y: startPos.y };
  const rect = containerRef.value.getBoundingClientRect();
  tempLine.end = { x: e.clientX - rect.left, y: e.clientY - rect.top };
};

const onGlobalMouseMove = (e) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (isConnecting.value) {
    tempLine.end = { x: mouseX, y: mouseY };
    return;
  }

  if (draggingSticker.value) {
    const s = draggingSticker.value;
    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;
    newX = Math.max(0, Math.min(newX, width.value - 160));
    newY = Math.max(0, Math.min(newY, height.value - 140));
    s.x = newX; s.y = newY;
    
    if (trashRef.value) {
      const tRect = trashRef.value.getBoundingClientRect();
      isHoveringTrash.value = (e.clientX >= tRect.left && e.clientX <= tRect.right && e.clientY >= tRect.top && e.clientY <= tRect.bottom);
    }
  }
};

const onGlobalMouseUp = () => {
  let hasChange = false;

  if (isConnecting.value) {
    if (hoverRivetId.value && hoverRivetId.value !== connectingStartId.value) {
      const exists = links.find(l => 
        (l.from === connectingStartId.value && l.to === hoverRivetId.value) || 
        (l.from === hoverRivetId.value && l.to === connectingStartId.value)
      );
      if (!exists) {
        links.push({ id: Date.now(), from: connectingStartId.value, to: hoverRivetId.value });
        hasChange = true;
      }
    }
    isConnecting.value = false;
    connectingStartId.value = null;
  }

  if (draggingSticker.value) {
    if (isHoveringTrash.value) {
      removeSticker(draggingSticker.value.id);
    } else {
      hasChange = true;
    }
    draggingSticker.value = null; 
    isHoveringTrash.value = false;
  }

  if (hasChange) saveData();
};

const getStickerPos = (id) => {
  const s = stickers.find(i => i.id === id);
  if (!s) return { x: 0, y: 0 };
  return { x: s.x + 80, y: s.y + 14 };
};
</script>

<style scoped>
.whiteboard-wrapper {
  width: 100%;
  height: 100%;
  position: relative; 
  background-color: #f4f6f8; 
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08); 
  overflow: hidden; 
  user-select: none;
}

.wb-toolbar {
  position: absolute; top: 15px; left: 50%; transform: translateX(-50%);
  background: white; padding: 6px; border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; gap: 8px; z-index: 50; align-items: center;
}
.tool-group { display: flex; gap: 4px; }
.tool-btn {
  border: 1px solid transparent; background: transparent; padding: 6px 12px; 
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: all 0.2s; color: #555; font-size: 14px;
}
.tool-btn:hover { background: #f5f5f5; }
.tool-btn.active { background: #e6f7ff; color: #1890ff; font-weight: 500; }
.tool-btn.danger:hover { background: #fff1f0; color: #ff4d4f; }
.icon { font-size: 16px; }
.label { font-size: 13px; }
.divider { width: 1px; height: 20px; background: #e0e0e0; margin: 0 4px; }

.board-area {
  width: 100%; height: 100%; position: relative;
  background-image: radial-gradient(#d1d1d1 1px, transparent 1px);
  background-size: 20px 20px;
}

canvas { position: absolute; top: 0; left: 0; z-index: 1; cursor: crosshair; }

.svg-layer { 
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; 
  pointer-events: none; 
}
.svg-layer.cut-mode .link-group { pointer-events: auto; cursor: pointer; }
.svg-layer.cut-mode .link-group:hover .visible-line-base,
.svg-layer.cut-mode .link-group:hover .visible-line-top {
  stroke: #ff4d4f !important; stroke-dasharray: 0 !important; transition: all 0.2s;
}

.sticker {
  position: absolute; width: 160px; height: 140px; padding: 25px 10px 10px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.1); border-radius: 4px; z-index: 5; cursor: grab;
  transform: rotate(-1deg); transition: transform 0.1s;
}
.sticker:active { cursor: grabbing; transform: scale(1.02); }

.rivet {
  position: absolute; top: 6px; left: 50%; transform: translateX(-50%);
  width: 14px; height: 14px; background: radial-gradient(circle at 30% 30%, #fff, #999);
  border-radius: 50%; border: 1px solid #777; z-index: 2; cursor: pointer; transition: all 0.2s;
}
.rivet:hover, .rivet.highlight {
  transform: translateX(-50%) scale(1.3); border-color: #1890ff; box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.3);
}

textarea {
  width: 100%; height: 100%; background: transparent; border: none; resize: none; outline: none;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}
.delete-btn { position: absolute; top: 2px; right: 6px; cursor: pointer; color: #aaa; }
.delete-btn:hover { color: red; }

.trash-can {
  position: absolute; bottom: 20px; right: 20px; width: 80px; height: 80px; 
  border: 2px dashed #bbb; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  background: rgba(255,255,255,0.8); color: #999; z-index: 30; transition: 0.3s;
}
.trash-icon { font-size: 28px; margin-bottom: 4px; }
.trash-label { font-size: 12px; }
.trash-can.active { transform: scale(1.1); background: #fff2f0; border-color: red; color: red; }
</style>