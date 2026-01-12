<template>
  <div class="page-centered-wrapper">
    
    <div class="dashboard-container" :class="{ 'focus-active': isFocusing }">
      
      <transition name="fade">
        <div v-if="isFocusing" class="focus-overlay">
          <div class="focus-card">
            <div class="focus-header">
              <span class="focus-tag">正在专注</span>
              <h2>{{ currentFocusTask?.text }}</h2>
            </div>
            <div class="timer">{{ formatTime(focusSeconds) }}</div>
            <div class="progress-bar">
               <div class="progress-fill" :style="{ width: focusProgress + '%' }"></div>
            </div>
            <div class="focus-controls">
              <button @click="stopFocus" class="btn-secondary">放弃专注</button>
              <button @click="completeFocusTask" class="btn-primary">完成任务</button>
            </div>
          </div>
        </div>
      </transition>

      <div class="main-layout">
        
        <div class="left-panel">
          <header class="panel-header">
            <div class="header-title">
              <h1>我的工作台</h1>
              <span class="date-today">{{ todayDate }}</span>
            </div>
            
            <div class="input-group">
              <div class="input-wrapper">
                <input 
                  v-model="newTodo" 
                  @keyup.enter="addTodo" 
                  type="text" 
                  placeholder="今天想做点什么？" 
                  class="main-input"
                />
                <div class="input-tools">
                  <select v-model="newTodoTag" class="mini-select" title="选择分类">
                    <option v-for="tag in tags" :key="tag.value" :value="tag.value">
                      {{ tag.label }}
                    </option>
                  </select>
                  <input 
                    type="datetime-local" 
                    v-model="newTodoDate" 
                    class="mini-date"
                    title="设置截止时间"
                  >
                </div>
              </div>
              <button @click="addTodo" class="btn-add" title="添加任务">
                <span class="icon-plus">+</span>
              </button>
            </div>
          </header>

          <div class="task-scroll-area">
            <draggable 
              v-model="todos" 
              item-key="id" 
              group="tasks" 
              class="task-list"
              handle=".drag-handle"
              @end="saveData"
              animation="300"
              ghost-class="ghost-card"
            >
              <template #item="{ element: todo }">
                <div 
                  class="task-card-wrapper" 
                  v-show="shouldShow(todo)"
                >
                  <div 
                    class="task-card" 
                    :class="{ 
                      'is-done': todo.done, 
                      'is-urgent': !todo.done && isUrgent(todo.dueDate),
                      'is-expired': !todo.done && isExpired(todo.dueDate)
                    }"
                  >
                    <div class="drag-handle" title="拖动排序">⠿</div>
                    
                    <label class="checkbox-wrapper">
                      <input type="checkbox" v-model="todo.done" @change="onCheck(todo)">
                      <span class="checkmark"></span>
                    </label>
                    
                    <div class="task-content">
                      <div 
                        class="task-text" 
                        v-if="editingId !== todo.id" 
                        @dblclick="startEdit(todo)"
                        :title="todo.text"
                      >
                          {{ todo.text }}
                      </div>
                      <input 
                        v-else 
                        v-model="editValue" 
                        @blur="finishEdit(todo)" 
                        @keyup.enter="finishEdit(todo)"
                        :ref="el => { if (el) editInputRef = el }"
                        class="edit-input"
                      >
                      
                      <div class="task-meta">
                        <span class="tag-badge" :class="`tag-${todo.tag}`">
                          {{ getTagName(todo.tag) }}
                        </span>
                        <span v-if="todo.dueDate" class="time-badge">
                          {{ isExpired(todo.dueDate) ? '已过期' : '' }} 
                          {{ formatDueDate(todo.dueDate) }}
                          {{ isUrgent(todo.dueDate) ? '🔥' : '' }}
                        </span>
                      </div>
                    </div>

                    <div class="task-actions">
                      <button 
                        @click="startFocus(todo)" 
                        class="action-btn focus-btn" 
                        title="开始专注" 
                        v-if="!todo.done && !isFocusing"
                      >
                        ⏲️
                      </button>
                      <button @click="removeTodo(todo.id)" class="action-btn delete-btn" title="删除">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
            
            <div v-if="todos.length === 0" class="empty-state">
              <div class="empty-icon">☕</div>
              <p>享受你的空闲时光吧</p>
            </div>
            
             <div v-else-if="filteredCount === 0" class="empty-state">
              <p>没有符合该条件的任务</p>
            </div>
          </div>
        </div>

        <div class="right-panel">
          
          <div class="user-card">
            <div class="user-header">
              <div class="avatar-box">
                <span class="avatar-emoji">😎</span>
              </div>
              <div class="user-info">
                <div class="level-text">等级 {{ level }}</div>
                <div class="xp-text">经验值 {{ currentXP }}/{{ nextLevelXP }}</div>
              </div>
            </div>
            <div class="xp-bar-bg">
              <div class="xp-bar-fill" :style="{ width: (currentXP / nextLevelXP) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="stats-box">
            <div class="stat-cell">
              <span class="stat-num">{{ completedCount }}</span>
              <span class="stat-desc">已完成</span>
            </div>
            <div class="divider"></div>
            <div class="stat-cell">
              <span class="stat-num warning">{{ remaining }}</span>
              <span class="stat-desc">待处理</span>
            </div>
          </div>

          <div class="filter-group">
            <h3 class="group-title">视图筛选</h3>
            <div 
              class="filter-item" 
              :class="{ active: currentFilter === 'all' }"
              @click="currentFilter = 'all'"
            >
              <span class="icon">📝</span> 全部任务
            </div>
            <div 
              class="filter-item" 
              :class="{ active: currentFilter === 'urgent' }"
              @click="currentFilter = 'urgent'"
            >
              <span class="icon">⚡</span> 紧急待办
              <span class="badge" v-if="urgentCount > 0">{{ urgentCount }}</span>
            </div>
             <div 
              class="filter-item" 
              :class="{ active: currentFilter === 'done' }"
              @click="currentFilter = 'done'"
            >
              <span class="icon">✅</span> 已完成
            </div>
          </div>
          
          <div class="bottom-tools">
              <button @click="clearCompleted" class="btn-clean" v-if="completedCount > 0">
                🧹 清理已完成任务
              </button>
          </div>

        </div>
      </div>
    </div>
  </div> 
  </template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'cn-dashboard-v2';

// === 核心数据 ===
const todos = ref([]);
const newTodo = ref('');
const newTodoDate = ref('');
const newTodoTag = ref('work'); 
const editingId = ref(null);
const editValue = ref('');
const editInputRef = ref(null);
const currentFilter = ref('all'); // 筛选状态：all, urgent, done

// 等级系统
const level = ref(1);
const totalXP = ref(0);

// 专注模式
const isFocusing = ref(false);
const currentFocusTask = ref(null);
const focusTotalSeconds = 25 * 60;
const focusSeconds = ref(focusTotalSeconds);
let timerInterval = null;

// 配置项
const tags = [
  { value: 'work', label: '工作' },
  { value: 'personal', label: '生活' },
  { value: 'study', label: '学习' },
];

// === 计算属性 ===
const completedCount = computed(() => todos.value.filter(t => t.done).length);
const remaining = computed(() => todos.value.length - completedCount.value);

// 计算紧急任务数量（24小时内且未完成）
const urgentCount = computed(() => todos.value.filter(t => !t.done && isUrgent(t.dueDate)).length);

// 获取当前日期字符串
const todayDate = computed(() => {
  const d = new Date();
  const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekMap[d.getDay()]}`;
});

// 计算专注进度百分比
const focusProgress = computed(() => {
    return ((focusTotalSeconds - focusSeconds.value) / focusTotalSeconds) * 100;
});

// 筛选逻辑核心：根据当前 filter 判断是否显示该任务
const shouldShow = (todo) => {
  if (currentFilter.value === 'all') {
    return !todo.done; // 默认"全部"只显示待办，如果想显示所有，直接 return true
  }
  if (currentFilter.value === 'urgent') {
    return !todo.done && isUrgent(todo.dueDate);
  }
  if (currentFilter.value === 'done') {
    return todo.done;
  }
  return true;
};

// 计算当前视图下有多少个任务（用于显示空状态）
const filteredCount = computed(() => {
  return todos.value.filter(t => shouldShow(t)).length;
});

// XP 计算
const nextLevelXP = computed(() => level.value * 100);
const currentXP = computed(() => {
  let requiredForCurrentLevel = 0;
  for (let i = 1; i < level.value; i++) {
    requiredForCurrentLevel += i * 100;
  }
  return totalXP.value - requiredForCurrentLevel;
});

// === 生命周期与持久化 ===

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      todos.value = data.todos || [];
      level.value = data.level || 1;
      totalXP.value = data.totalXP || 0;
    } catch(e) {}
  }
});

const saveData = () => {
  const data = {
    todos: todos.value,
    level: level.value,
    totalXP: totalXP.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

watch([todos, level, totalXP], saveData, { deep: true });

// === 方法 ===

const addTodo = () => {
  if (!newTodo.value.trim()) return;
  
  todos.value.unshift({
    id: Date.now(),
    text: newTodo.value,
    done: false,
    tag: newTodoTag.value,
    dueDate: newTodoDate.value || null,
    createdAt: Date.now()
  });
  
  newTodo.value = '';
  // 不重置日期和标签，方便连续添加
};

const onCheck = (todo) => {
  if (todo.done) {
    addXP(10);
    triggerConfetti();
  }
  // 如果当前在"待办"视图，勾选后任务会消失（符合逻辑），反之亦然
};

const removeTodo = (id) => {
  if(confirm('确定要删除这个任务吗？')) {
      const index = todos.value.findIndex(t => t.id === id);
      if (index !== -1) todos.value.splice(index, 1);
  }
};

const clearCompleted = () => {
  if(confirm('确定清理所有已完成任务？')) {
      todos.value = todos.value.filter(t => !t.done);
  }
};

const startEdit = (todo) => {
  editingId.value = todo.id;
  editValue.value = todo.text;
  nextTick(() => {
      editInputRef.value?.focus();
  });
};

const finishEdit = (todo) => {
  if (editValue.value.trim()) {
    todo.text = editValue.value.trim();
  }
  editingId.value = null;
};

// === 游戏化 & 专注 ===

const addXP = (amount) => {
  totalXP.value += amount;
  let currentRequired = level.value * 100;
  if (currentXP.value + amount >= currentRequired) {
    level.value++;
    triggerLevelUpConfetti();
  }
};

const startFocus = (todo) => {
  currentFocusTask.value = todo;
  isFocusing.value = true;
  focusSeconds.value = focusTotalSeconds;
  
  timerInterval = setInterval(() => {
    if (focusSeconds.value > 0) {
      focusSeconds.value--;
    } else {
      stopFocus();
      alert("专注完成！太棒了！");
    }
  }, 1000);
};

const stopFocus = () => {
  isFocusing.value = false;
  clearInterval(timerInterval);
  timerInterval = null;
  currentFocusTask.value = null;
};

const completeFocusTask = () => {
  if (currentFocusTask.value) {
    const task = todos.value.find(t => t.id === currentFocusTask.value.id);
    if (task && !task.done) {
      task.done = true;
      onCheck(task);
    }
  }
  stopFocus();
};

// === 辅助工具 ===

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const formatDueDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  
  // 如果是今年，不显示年份
  const isThisYear = date.getFullYear() === now.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours().toString().padStart(2,'0');
  const min = date.getMinutes().toString().padStart(2,'0');
  
  return `${m}月${d}日 ${h}:${min}`;
};

const isUrgent = (dateStr) => {
  if (!dateStr) return false;
  const now = new Date();
  const due = new Date(dateStr);
  const diff = due - now;
  // 24小时内
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
};

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const getTagName = (t) => {
  const tag = tags.find(tag => tag.value === t);
  return tag ? tag.label : ''; 
};

// === 特效 ===
const triggerConfetti = () => {
  confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 }, colors: ['#4caf50', '#8bc34a'] });
};
const triggerLevelUpConfetti = () => {
  confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#ff5722'] });
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

* {
  box-sizing: border-box;
}

/* 2. 新增：居中包装器的样式 */
.page-centered-wrapper {
  width: 100%;
  height: 100%;
  display: flex;       /* 开启弹性布局 */
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  /* 如果你的内容区有滚动条，这里可能需要 padding-bottom 来避免贴底 */
}

/* === 主容器：毛玻璃 + 现代圆角 === */
.dashboard-container {
  width: 1000px; 
  height: 650px;
  background: #f3f6f9; /* 柔和的底色 */
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset;
  display: flex;
  overflow: hidden;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #2c3e50;
  position: relative;
  /* 移除这里的 margin: auto，因为我们用了外层 flex 居中，这样更稳定 */
}

.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* === 左侧面板：白底 === */
.left-panel {
  flex: 7;
  padding: 32px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #ebedf0;
}

.header-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-title h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.date-today {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

/* 输入框组合 */
.input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.input-wrapper {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.main-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 15px;
  outline: none;
  color: #334155;
  font-weight: 500;
}

.input-tools {
  display: flex;
  gap: 8px;
  border-left: 1px solid #e2e8f0;
  padding-left: 10px;
}

.mini-select, .mini-date {
  border: none;
  background: transparent;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  outline: none;
  font-family: inherit;
}
.mini-select:hover, .mini-date:hover { color: #3b82f6; }

.btn-add {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s;
}
.btn-add:hover { transform: translateY(-2px); }
.icon-plus { font-size: 24px; font-weight: 300; line-height: 1; }

/* === 任务列表区 === */
.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}
/* 美化滚动条 */
.task-scroll-area::-webkit-scrollbar { width: 6px; }
.task-scroll-area::-webkit-scrollbar-track { background: transparent; }
.task-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.task-card-wrapper {
  margin-bottom: 12px;
}

.task-card {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #f1f5f9;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.task-card.is-urgent { border-left: 4px solid #f59e0b; }
.task-card.is-expired { border-left: 4px solid #ef4444; }
.task-card.is-done { opacity: 0.6; background: #f8fafc; }
.task-card.is-done .task-text { text-decoration: line-through; color: #94a3b8; }

.ghost-card { opacity: 0.4; background: #e2e8f0; border: 2px dashed #94a3b8; }

/* 拖拽手柄 */
.drag-handle {
  color: #cbd5e1;
  cursor: grab;
  padding: 4px;
  margin-right: 8px;
  font-size: 16px;
}
.drag-handle:hover { color: #94a3b8; }

/* 复选框美化 */
.checkbox-wrapper {
  position: relative;
  margin-right: 16px;
  cursor: pointer;
}
.checkbox-wrapper input { display: none; }
.checkbox-wrapper .checkmark {
  display: block; width: 20px; height: 20px;
  border: 2px solid #cbd5e1; border-radius: 6px;
  transition: all 0.2s;
}
.checkbox-wrapper input:checked + .checkmark {
  background: #22c55e;
  border-color: #22c55e;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0; /* 防止文本溢出 */
}

.task-text {
  font-size: 15px;
  color: #334155;
  font-weight: 500;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-input {
  width: 100%;
  font-size: 15px;
  padding: 4px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  outline: none;
}

.task-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.tag-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 11px;
}
.tag-work { background: #eff6ff; color: #3b82f6; } /* 蓝 */
.tag-personal { background: #fff7ed; color: #f97316; } /* 橙 */
.tag-study { background: #f0fdf4; color: #22c55e; } /* 绿 */

.time-badge {
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}
.is-urgent .time-badge { color: #f59e0b; background: #fffbeb; }
.is-expired .time-badge { color: #ef4444; background: #fef2f2; }

/* 悬停按钮 */
.task-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s;
}
.task-card:hover .task-actions { opacity: 1; transform: translateX(0); }

.action-btn {
  width: 32px; height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  transition: 0.2s;
}
.focus-btn { background: #e0f2fe; color: #0284c7; }
.focus-btn:hover { background: #bae6fd; }
.delete-btn { background: #fee2e2; color: #ef4444; }
.delete-btn:hover { background: #fecaca; }


/* === 右侧面板：灰色底 + 卡片 === */
.right-panel {
  flex: 3;
  padding: 32px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-card {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.avatar-box {
  width: 48px; height: 48px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.avatar-emoji { font-size: 24px; }
.user-info { display: flex; flex-direction: column; }
.level-text { font-size: 16px; font-weight: 800; color: #0f172a; }
.xp-text { font-size: 12px; color: #64748b; }

.xp-bar-bg {
  height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;
}
.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stats-box {
  display: flex;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  justify-content: space-around;
  align-items: center;
}
.stat-cell { text-align: center; }
.divider { width: 1px; height: 30px; background: #e2e8f0; }
.stat-num { display: block; font-size: 20px; font-weight: 700; color: #334155; }
.stat-num.warning { color: #f59e0b; }
.stat-desc { font-size: 12px; color: #94a3b8; }

/* 筛选列表 */
.group-title {
  font-size: 12px; color: #94a3b8; margin: 0 0 12px 4px; letter-spacing: 1px;
}
.filter-item {
  display: flex; align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  transition: 0.2s;
  margin-bottom: 4px;
}
.filter-item .icon { margin-right: 10px; font-size: 16px; }
.filter-item:hover { background: #e2e8f0; color: #334155; }
.filter-item.active { background: #fff; color: #3b82f6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1); }
.badge {
  margin-left: auto;
  background: #fee2e2; color: #ef4444;
  padding: 2px 8px; border-radius: 10px; font-size: 11px;
}

.bottom-tools { margin-top: auto; }
.btn-clean {
  width: 100%;
  padding: 12px;
  border: 1px dashed #cbd5e1;
  background: transparent;
  color: #94a3b8;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 13px;
}
.btn-clean:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* === 专注遮罩 === */
.focus-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(15px);
  z-index: 99;
  display: flex; align-items: center; justify-content: center;
}
.focus-card {
  text-align: center;
  width: 400px;
}
.focus-tag { display: block; font-size: 12px; color: #64748b; letter-spacing: 2px; margin-bottom: 8px; }
.focus-header h2 { font-size: 24px; color: #0f172a; margin: 0 0 30px 0; }

.timer {
  font-size: 72px; font-weight: 200; color: #3b82f6;
  font-variant-numeric: tabular-nums;
  margin-bottom: 30px;
}

.progress-bar {
  height: 6px; background: #e2e8f0; width: 100%; border-radius: 3px; overflow: hidden; margin-bottom: 40px;
}
.progress-fill { height: 100%; background: #3b82f6; transition: width 1s linear; }

.focus-controls { display: flex; gap: 16px; justify-content: center; }
.btn-primary, .btn-secondary {
  padding: 12px 32px; border-radius: 30px; border: none; font-size: 15px; cursor: pointer; transition: 0.2s;
}
.btn-primary { background: #22c55e; color: white; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3); }
.btn-primary:hover { transform: translateY(-2px); background: #16a34a; }
.btn-secondary { background: #f1f5f9; color: #64748b; }
.btn-secondary:hover { background: #e2e8f0; color: #334155; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.empty-state {
  text-align: center; color: #94a3b8; margin-top: 60px;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5; }

</style>