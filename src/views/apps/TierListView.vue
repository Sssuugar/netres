<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';

// ------------------------------------
// 1. 数据定义
// ------------------------------------

const tierListTitle = ref('请输入你的自定义标题');

// 排名层级定义 (Tier List Structure)
const tiers = ref([
    { id: 1, name: '夯', color: 'rgb(255, 0, 0)', items: [], isEditing: false },
    { id: 2, name: '顶级', color: 'rgb(255, 165, 0)', items: [], isEditing: false },
    { id: 3, name: '一般', color: 'rgb(255, 255, 0)', items: [], isEditing: false },
    { id: 4, name: 'NPC', color: 'rgb(80, 80, 80)', items: [], isEditing: false },
    { id: 5, name: '拉', color: 'rgb(255, 255, 255)', items: [], isEditing: false },
]);

// 初始未分类项目为空数组
const unclassifiedItems = ref([]);

// 拖放状态
const draggingItemId = ref(null);

// 新增项目和文件输入引用
const newItemText = ref('');
const fileInput = ref(null);
const nextItemId = ref(101); // 确保ID从101开始

// 主题和设置抽屉状态
const theme = ref('dark'); // 默认主题为深色 'dark' 或 'light'
const isSettingsPanelOpen = ref(false);

// 💥 新增：清除确认模态框状态
const isClearModalOpen = ref(false);

// ------------------------------------
// 2. 核心方法
// ------------------------------------

// 保存数据到 localStorage
const saveTierList = () => {
    // 移除 tiers 中的 isEditing 和 originalName 状态，避免持久化临时状态
    const serializableTiers = tiers.value.map(tier => {
        const { isEditing, originalName, ...rest } = tier; 
        return rest;
    });

    const data = {
        title: tierListTitle.value,
        tiers: serializableTiers,
        unclassified: unclassifiedItems.value,
        nextItemId: nextItemId.value,
        theme: theme.value, 
    };
    localStorage.setItem('tierListData', JSON.stringify(data));
    console.log('数据已保存！');
};

// 从 localStorage 加载数据
const loadTierList = () => {
    const storedData = localStorage.getItem('tierListData');
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            tierListTitle.value = data.title;
            // 加载时添加 isEditing 状态
            tiers.value = data.tiers.map(tier => ({
                ...tier,
                isEditing: false
            }));
            unclassifiedItems.value = data.unclassified;
            nextItemId.value = data.nextItemId || 101;
            theme.value = data.theme || 'dark';
        } catch (e) {
            console.error("加载 Tier List 数据失败，可能缓存已损坏。", e);
            localStorage.removeItem('tierListData');
        }
    }
};

// 页面加载时尝试加载数据并注册事件
onMounted(() => {
    loadTierList();
    document.addEventListener('paste', handlePaste);
    window.addEventListener('beforeunload', saveTierList);
});

// 页面卸载时取消事件监听器
onUnmounted(() => {
    document.removeEventListener('paste', handlePaste);
    window.removeEventListener('beforeunload', saveTierList);
});

// 监听主题变化并应用到根元素
watch(theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
}, { immediate: true });

// 💥 修改：打开清除确认模态框
const clearAllItems = () => {
    isClearModalOpen.value = true;
};

// 💥 新增：确认执行清除操作
const confirmClear = () => {
    tiers.value.forEach(tier => {
        tier.items = [];
    });
    unclassifiedItems.value = [];
    tierListTitle.value = '请输入你的自定义标题';
    nextItemId.value = 101;
    saveTierList();
    isClearModalOpen.value = false; // 关闭模态框
    console.log('所有项目已清除！');
};

// ------------------------------------
// 3. 拖放 (Drag and Drop) 逻辑
// ------------------------------------

const handleDragStart = (itemId) => {
    draggingItemId.value = itemId;
};

const handleDragEnter = (e) => {
    e.preventDefault();
};

const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

const handleDrop = (targetTierId) => {
    if (!draggingItemId.value) return;

    let draggedItem = null;

    // 1. 从所有区域中查找并移除被拖动的项目
    const removeItemFromTier = (tier) => {
        const index = tier.items.findIndex(item => item.id === draggingItemId.value);
        if (index !== -1) {
            draggedItem = tier.items.splice(index, 1)[0]; 
            return true;
        }
        return false;
    };
    
    // 查找并从已分类层级中移除
    if (!tiers.value.some(removeItemFromTier)) {
        // 查找并从未分类区域中移除
        const index = unclassifiedItems.value.findIndex(item => item.id === draggingItemId.value);
        if (index !== -1) {
            draggedItem = unclassifiedItems.value.splice(index, 1)[0];
        }
    }

    if (!draggedItem) {
        draggingItemId.value = null;
        return;
    }

    // 2. 放置到目标区域
    if (targetTierId === 'unclassified') {
        draggedItem.tierId = null;
        unclassifiedItems.value.push(draggedItem);
    } else {
        const targetTier = tiers.value.find(t => t.id === targetTierId);
        if (targetTier) {
            draggedItem.tierId = targetTierId;
            targetTier.items.push(draggedItem);
        }
    }

    draggingItemId.value = null;
    saveTierList();
};

// ------------------------------------
// 4. 编辑和添加
// ------------------------------------

// 添加自定义文本项目
const addCustomItem = () => {
    if (newItemText.value.trim() === '') return;

    const newItem = {
        id: nextItemId.value++,
        type: 'text',
        content: newItemText.value.trim(),
        tierId: null
    };
    unclassifiedItems.value.push(newItem);
    newItemText.value = '';
    saveTierList();
};

// 统一处理图片文件，将其转换为 Base64
const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
        console.error('不是有效的图片文件');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const newItem = {
            id: nextItemId.value++,
            type: 'image',
            content: e.target.result, // Base64 Data URL
            tierId: null
        };
        unclassifiedItems.value.push(newItem);
        saveTierList();
    };
    reader.readAsDataURL(file);
};

// 处理本地图片上传并转换为 Base64 
const handleImageUpload = (event) => {
    const file = event.target.files[0];
    processImageFile(file);
    event.target.value = null;
};

// 从剪贴板粘贴图片 (Ctrl+V/Cmd+V)
const handlePaste = (event) => {
    const items = event.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            processImageFile(file);
            event.preventDefault(); // 阻止默认粘贴行为
            break; 
        }
    }
};

// 💥 移除项目
const removeItem = (itemId) => {
    // 只在 unclassifiedItems 中移除
    const unclassifiedIndex = unclassifiedItems.value.findIndex(item => item.id === itemId);
    if (unclassifiedIndex !== -1) {
        unclassifiedItems.value.splice(unclassifiedIndex, 1);
        saveTierList();
        return;
    }
};

// ------------------------------------
// 5. 设置抽屉方法
// ------------------------------------

const toggleSettingsPanel = () => {
    isSettingsPanelOpen.value = !isSettingsPanelOpen.value;
};

const setTheme = (newTheme) => {
    theme.value = newTheme;
    saveTierList();
};


// ------------------------------------
// 6. Tier 标题编辑方法 
// ------------------------------------

// 自定义指令：v-focus，用于在编辑时自动聚焦输入框
const vFocus = {
    mounted: (el) => {
        el.focus();
        el.select();
    }
};

// 启用编辑模式
const startTierEdit = (tier) => {
    // 保存原始名称
    tier.originalName = tier.name;
    tier.isEditing = true;
};

// 结束编辑模式 (保存)
const finishTierEdit = (tier) => {
    // 确保标题不为空，如果为空，恢复为原始名称
    if (tier.name.trim() === '') {
        // 在实际应用中，这里应该使用更友好的 Toast 或 Dialog，而不是 alert
        alert(`层级名称不能为空！已恢复为 "${tier.originalName}"。`); 
        tier.name = tier.originalName; // 恢复原始值
    }
    
    tier.isEditing = false;
    saveTierList();
    delete tier.originalName;
};
</script>

<template>
  <div class="tier-list-maker" :data-theme="theme">
    <div class="main-window">

      <header class="header">
        <div class="header-left">
          <span class="back-arrow" @click="() => {}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <input
            v-model="tierListTitle"
            placeholder="请输入你的自定义标题"
            class="title-input"
            @blur="saveTierList"
          />
        </div>
        <div class="header-right">
          <button class="header-button clear-button" @click="clearAllItems">清除全部</button> 
          <button class="header-button preview-button" @click="saveTierList">预览</button>
          <button class="header-button save-button" @click="saveTierList">保存</button>
          <button class="header-button settings-button" @click="toggleSettingsPanel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0001 2.37878C12.4411 2.37878 12.8001 2.73778 12.8001 3.17878V5.34006C14.0722 5.56816 15.2536 6.13426 16.2301 6.97878L17.5878 5.62101C17.9048 5.304 18.3951 5.304 18.7121 5.62101L20.3788 7.28768C20.6958 7.60468 20.6958 8.09501 20.3788 8.41201L19.021 9.76978C19.8656 10.7463 20.4317 11.9276 20.6597 13.2001H22.821C23.262 13.2001 23.621 13.5591 23.621 14.0001V15.9998C23.621 16.4408 23.262 16.7998 22.821 16.7998H20.6597C20.4317 18.0723 19.8656 19.2536 19.021 20.2301L20.3788 21.5879C20.6958 21.9049 20.6958 22.3952 20.3788 22.7122L18.7121 24.3789C18.3951 24.6959 17.9048 24.6959 17.5878 24.3789L16.2301 23.0211C15.2536 23.8656 14.0722 24.4317 12.8001 24.6598V26.821C12.8001 27.262 12.4411 27.621 12.0001 27.621H10.0001C9.55905 27.621 9.20006 27.262 9.20006 26.821V24.6598C7.92797 24.4317 6.74665 23.8656 5.77013 23.0211L4.41236 24.3789C4.09536 24.6959 3.60503 24.6959 3.28803 24.3789L1.62136 22.7122C1.30436 22.3952 1.30436 21.9049 1.62136 21.5879L2.97913 20.2301C2.13462 19.2536 1.56852 18.0723 1.34042 16.7998H-0.820876C-1.26187 16.7998 -1.62087 16.4408 -1.62087 15.9998V14.0001C-1.62087 13.5591 -1.26187 13.2001 -0.820876 13.2001H1.34042C1.56852 11.9276 2.13462 10.7463 2.97913 9.76978L1.62136 8.41201C1.30436 8.09501 1.30436 7.60468 1.62136 7.28768L3.28803 5.62101C3.60503 5.304 4.09536 5.304 4.41236 5.62101L5.77013 6.97878C6.74665 6.13426 7.92797 5.56816 9.20006 5.34006V3.17878C9.20006 2.73778 9.55905 2.37878 10.0001 2.37878H12.0001Z" transform="translate(1 0)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="15" r="3" fill="currentColor"/></svg>
          </button>
        </div>
      </header>

      <main class="main-content">
        <div class="tier-list-container">
          <div
            v-for="tier in tiers"
            :key="tier.id"
            class="tier-row"
            @dragenter="handleDragEnter"
            @dragover="handleDragOver"
            @drop="() => handleDrop(tier.id)"
          >
            <div 
              class="tier-name-cell" 
              :style="{ 
                backgroundColor: tier.color, 
                // 优化颜色逻辑：白色或亮黄色使用深色文字，其他使用白色文字
                color: (tier.color === 'rgb(255, 255, 255)' || tier.color === 'rgb(255, 255, 0)') ? 'var(--color-text-dark)' : '#fff' 
              }"
              @dblclick="startTierEdit(tier)"
            >
              <span v-if="!tier.isEditing" class="tier-name-display">
                {{ tier.name }}
              </span>
              <input
                v-else
                v-model="tier.name"
                class="tier-name-edit-input"
                type="text"
                @blur="finishTierEdit(tier)"
                @keyup.enter="finishTierEdit(tier)"
                v-focus
                :style="{ 
                  backgroundColor: tier.color, 
                  color: (tier.color === 'rgb(255, 255, 255)' || tier.color === 'rgb(255, 255, 0)') ? 'var(--color-text-dark)' : '#fff' 
                }"
              />
            </div>
            <div class="tier-content-cell">
              <div v-if="tier.items.length === 0" class="placeholder-text">
                拖放内容到此层级
              </div>
              <div
                v-for="item in tier.items"
                :key="item.id"
                class="tier-item"
                draggable="true"
                @dragstart="() => handleDragStart(item.id)"
                :class="{ 'is-dragging': draggingItemId === item.id }"
              >
                <span v-if="item.type === 'text'" class="item-text">{{ item.content }}</span>
                <img v-else-if="item.type === 'image'" :src="item.content" alt="Tier Item" class="item-image" />
                
                </div>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="unclassified-box"
            @dragenter="handleDragEnter"
            @dragover="handleDragOver"
            @drop="() => handleDrop('unclassified')"
          >
            <h3 class="box-title">未分类项目 (拖放至此取消分类)</h3>
            <div class="unclassified-content">
              <div v-if="unclassifiedItems.length === 0" class="placeholder-text-sidebar">
                无未分类项目，请在下方添加或粘贴 (Ctrl+V) 图片。
              </div>
              <div
                v-for="item in unclassifiedItems"
                :key="item.id"
                class="tier-item"
                draggable="true"
                @dragstart="() => handleDragStart(item.id)"
                :class="{ 'is-dragging': draggingItemId === item.id }"
              >
                <span v-if="item.type === 'text'" class="item-text">{{ item.content }}</span>
                <img v-else-if="item.type === 'image'" :src="item.content" alt="Tier Item" class="item-image" />
                
                <button class="remove-item-btn" @click.stop="removeItem(item.id)">
                  &times;
                </button>
              </div>
            </div>
          </div>

          <div class="toolbar">
            <h3 class="box-title">添加项目</h3>
            <input type="text" v-model="newItemText" placeholder="输入自定义文字..." class="new-item-input" @keyup.enter="addCustomItem"/>
            <div class="button-group">
              <button @click="addCustomItem" class="add-text-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 21V19C5 15.134 8.13401 12 12 12C15.866 12 19 15.134 19 19V21M17 9C17 11.7614 14.7614 14 12 14C9.23858 14 7 11.7614 7 9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                添加文字
              </button>
              
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleImageUpload" 
                accept="image/*" 
                style="display: none;"
              />
              <button @click="fileInput.click()" class="add-image-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8C17.7614 8 20 5.76142 20 3C20 0.238576 17.7614 -2 15 -2C12.2386 -2 10 0.238576 10 3C10 5.76142 12.2386 8 15 8ZM4 19V17C4 14.2386 6.23858 12 9 12H12M18 19V17C18 14.2386 15.7614 12 13 12H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                本地图片
              </button>
            </div>
          </div>
        </aside>

      </main>
    
      <Transition name="slide-fade">
        <div class="settings-panel" v-if="isSettingsPanelOpen">
          <div class="setting-group">
            <span class="setting-label">主题设置</span>
            <div class="theme-switcher">
              <button 
                @click="setTheme('dark')" 
                :class="['theme-button', 'dark-theme-button', { active: theme === 'dark' }]"
              >
                夜间 (Dark)
              </button>
              <button 
                @click="setTheme('light')" 
                :class="['theme-button', 'light-theme-button', { active: theme === 'light' }]"
              >
                日间 (Light)
              </button>
            </div>
          </div>
          <div class="panel-note">
            <p>💡 提示：您现在可以直接粘贴 (Ctrl+V) 剪贴板中的图片到未分类区域。</p>
            <p>💡 提示：双击层级名称即可修改标题！</p>
          </div>
        </div>
      </Transition>

      <div class="overlay" v-if="isSettingsPanelOpen" @click="toggleSettingsPanel"></div>

    </div>

    <Transition name="fade-in">
        <div class="modal-overlay" v-if="isClearModalOpen" @click="isClearModalOpen = false">
            <div class="clear-modal" @click.stop>
                <div class="modal-header">
                    <h3 class="modal-title">⚠️ 确认清除全部项目</h3>
                </div>
                <div class="modal-body">
                    <p>您确定要清除所有的 Tier List 项目、标题和未分类项目吗？</p>
                    <p class="warning-text">此操作不可撤销，您将丢失所有数据！</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-button cancel-button" @click="isClearModalOpen = false">取消</button>
                    <button class="modal-button confirm-clear-button" @click="confirmClear">确定清除</button>
                </div>
            </div>
        </div>
    </Transition>

  </div>
</template>

<style scoped>
/* ------------------------------------
 * 颜色变量定义 (Theme Variables)
 * ------------------------------------ */
/* Dark Theme (默认) */
:root, .tier-list-maker[data-theme='dark'] {
    --color-bg-primary: #1c1c1e;
    --color-bg-secondary: rgba(44, 44, 46, 0.7);
    --color-text-primary: #f0f0f0;
    --color-text-secondary: rgba(255, 255, 255, 0.5);
    --color-text-dark: #1c1c1e; /* 黑色用于白色或亮色背景上的文字 */
    --color-border: rgba(255, 255, 255, 0.1);
    --color-content-bg: rgba(0, 0, 0, 0.15);
    --color-item-bg: rgba(255, 255, 255, 0.05);
    --color-sidebar-bg: rgba(0, 0, 0, 0.2);
    --blur-effect: blur(20px);
}

/* Light Theme */
.tier-list-maker[data-theme='light'] {
    --color-bg-primary: #f5f5f7;
    --color-bg-secondary: rgba(255, 255, 255, 0.85);
    --color-text-primary: #1c1c1e;
    --color-text-secondary: rgba(0, 0, 0, 0.4);
    --color-text-dark: #1c1c1e;
    --color-border: rgba(0, 0, 0, 0.1);
    --color-content-bg: rgba(0, 0, 0, 0.05);
    --color-item-bg: rgba(0, 0, 0, 0.03);
    --color-sidebar-bg: rgba(0, 0, 0, 0.08);
    --blur-effect: blur(15px);
}


/* ------------------------------------
 * 全屏及居中布局 (macOS Background)
 * ------------------------------------ */
.tier-list-maker {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--color-bg-primary); 
    color: var(--color-text-primary); 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    
    display: flex;
    justify-content: center;
    align-items: center;
}

.main-window {
    width: 90%;
    max-width: 1400px;
    height: 90%;
    max-height: 900px;
    
    background-color: var(--color-bg-secondary); 
    backdrop-filter: var(--blur-effect); 
    -webkit-backdrop-filter: var(--blur-effect);
    
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); 
    
    padding: 20px;
    display: flex;
    flex-direction: column;
}

/* ------------------------------------
 * 顶部导航 (Header)
 * ------------------------------------ */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 10px 20px 10px;
    border-bottom: 1px solid var(--color-border); 
}

.header-left {
    display: flex;
    align-items: center;
}

.back-arrow {
    cursor: pointer;
    opacity: 0.8;
    margin-right: 15px;
}
.back-arrow svg {
    color: var(--color-text-primary);
}

.title-input {
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-size: 1.6em;
    font-weight: 600; 
    padding: 5px 0;
    width: 400px;
    caret-color: #0a84ff;
}
.title-input::placeholder {
    color: var(--color-text-secondary);
}

.header-right button {
    padding: 6px 15px;
    margin-left: 10px;
    border: none;
    border-radius: 6px; 
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s, opacity 0.2s;
}

.header-button {
    background-color: var(--color-item-bg); 
    color: var(--color-text-primary);
}
.header-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.tier-list-maker[data-theme='light'] .header-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.save-button {
    background-color: #0a84ff; 
    color: white;
}
.save-button:hover {
    background-color: #3197ff;
}

.clear-button { 
    background-color: #ff3b30;
    color: white;
}
.clear-button:hover {
    background-color: #e53329;
}


.settings-button {
    background: none;
    padding: 5px;
}
.settings-button svg {
    color: var(--color-text-primary);
}

/* ------------------------------------
 * 主体布局 (Main Content)
 * ------------------------------------ */
.main-content {
    flex-grow: 1;
    display: flex;
    gap: 20px;
    overflow: hidden;
}

.tier-list-container {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 10px; 
    /* 滚动条美化 (Webkit) */
    scrollbar-color: #444 #222;
    scrollbar-width: thin;
}
.tier-list-maker[data-theme='light'] .tier-list-container {
    scrollbar-color: #ccc #eee;
}

.tier-list-container::-webkit-scrollbar {
    width: 6px;
}
.tier-list-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}
.tier-list-maker[data-theme='light'] .tier-list-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
}
.tier-list-container::-webkit-scrollbar-track {
    background: transparent;
}


/* ------------------------------------
 * Tier Row 样式
 * ------------------------------------ */
.tier-row {
    display: flex;
    border: 1px solid var(--color-border);
    min-height: 85px;
    margin-bottom: 10px;
    border-radius: 8px;
    overflow: hidden;
}

.tier-name-cell {
    width: 120px;
    min-width: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.1em;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    user-select: none;
    cursor: pointer; /* 指示可双击 */
    position: relative;
}

/* 编辑时的输入框样式 */
.tier-name-edit-input {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 0 5px;
    margin: 0;
    box-sizing: border-box;
    text-align: center;
    border: none;
    outline: none;
    font-size: 1em;
    font-weight: 700;
}

.tier-name-display {
    padding: 5px;
    word-break: break-all;
}

.tier-content-cell {
    flex-grow: 1;
    padding: 8px;
    background-color: var(--color-content-bg);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.placeholder-text {
    color: var(--color-text-secondary);
    font-size: 0.9em;
    align-self: center;
    padding-left: 15px;
}


/* ------------------------------------
 * Item 样式 (固定尺寸)
 * ------------------------------------ */
.tier-item {
    width: 70px; 
    height: 70px;
    border: 1px solid var(--color-border);
    background-color: var(--color-item-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); 
    overflow: hidden;
    flex-shrink: 0;
    position: relative; /* 确保相对定位，以便删除按钮绝对定位 */
}

.tier-item:hover {
    transform: translateY(-2px); 
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); 
}

.tier-item.is-dragging {
    opacity: 0.7;
    border: 2px dashed #0a84ff;
    background-color: rgba(10, 132, 255, 0.2);
}

.item-text {
    text-align: center;
    padding: 5px;
    font-size: 0.85em;
    font-weight: 500;
    color: var(--color-text-primary);
    word-break: break-all;
}

.item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 删除按钮样式 */
.remove-item-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    
    width: 20px;
    height: 20px;
    line-height: 14px; 
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: white;
    
    background-color: #ff3b30; 
    border: 1px solid white;
    border-radius: 50%; 
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    z-index: 10; 
    padding: 0;
    transition: background-color 0.2s, transform 0.2s;
}

.remove-item-btn:hover {
    background-color: #e53329;
    transform: scale(1.1);
}


/* ------------------------------------
 * 侧边栏和工具栏 (Sidebar)
 * ------------------------------------ */
.sidebar {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.unclassified-box, .toolbar {
    background-color: var(--color-sidebar-bg); 
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 15px;
}

.box-title {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1em;
    color: var(--color-text-primary);
    font-weight: 700;
}

.unclassified-content {
    min-height: 100px;
    max-height: 400px; 
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 5px;
}

.placeholder-text-sidebar {
    color: var(--color-text-secondary);
    font-size: 0.8em;
    align-self: center;
}

.toolbar {
    display: flex;
    flex-direction: column;
}

.new-item-input {
    padding: 10px;
    border: 1px solid var(--color-border);
    background-color: var(--color-item-bg);
    color: var(--color-text-primary);
    border-radius: 6px;
    margin-bottom: 15px;
}

.button-group {
    display: flex;
    gap: 10px;
}

.toolbar button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: background-color 0.2s;
}

.add-text-button {
    background-color: #0a84ff;
    color: white;
}
.add-text-button:hover {
    background-color: #3197ff;
}

.add-image-button {
    background-color: #34c759;
    color: white;
}
.add-image-button:hover {
    background-color: #51d471;
}

.toolbar button svg {
    color: white;
}

/* ------------------------------------
 * 设置抽屉面板 (Settings Panel)
 * ------------------------------------ */
.settings-panel {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 350px;
    z-index: 100;
    
    background-color: var(--color-bg-secondary);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
    border-left: 1px solid var(--color-border);
    padding: 20px;
    box-shadow: -4px 0 10px rgba(0, 0, 0, 0.2);
}

.setting-group {
    margin-bottom: 20px;
}

.setting-label {
    display: block;
    font-size: 0.9em;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--color-text-primary);
}

.theme-switcher {
    display: flex;
    background-color: var(--color-content-bg);
    border-radius: 8px;
    padding: 4px;
}

.theme-button {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    background-color: transparent;
    color: var(--color-text-primary);
}

.theme-button.active {
    background-color: var(--color-bg-secondary); 
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-theme-button.active {
    color: var(--color-text-primary);
}

.light-theme-button.active {
    color: var(--color-text-dark);
}

.panel-note {
    margin-top: 30px;
    padding: 10px;
    background-color: rgba(10, 132, 255, 0.1);
    border-left: 4px solid #0a84ff;
    border-radius: 4px;
    font-size: 0.8em;
}

/* 抽屉过渡效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(100%);
}

/* 遮罩层样式 */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 90;
}

/* ------------------------------------
 * 💥 清除确认模态框样式 (Clear Modal)
 * ------------------------------------ */

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 200; /* 确保在所有内容之上 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.clear-modal {
    width: 350px;
    background-color: var(--color-bg-secondary);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    padding: 20px;
    color: var(--color-text-primary);
    transform: scale(1);
    transition: transform 0.3s ease-out;
}

.modal-header {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 10px;
    margin-bottom: 15px;
}

.modal-title {
    margin: 0;
    font-size: 1.2em;
    font-weight: 700;
    color: #ff5f56; /* 警告色 */
}

.modal-body p {
    font-size: 0.9em;
    margin: 10px 0;
}

.warning-text {
    font-weight: 600;
    color: #ff3b30;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid var(--color-border);
}

.modal-button {
    padding: 8px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s, opacity 0.2s;
}

.cancel-button {
    background-color: var(--color-item-bg);
    color: var(--color-text-primary);
}
.cancel-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}
.tier-list-maker[data-theme='light'] .cancel-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
}


.confirm-clear-button {
    background-color: #ff3b30; /* 红色警告 */
    color: white;
}
.confirm-clear-button:hover {
    background-color: #e53329;
}

/* 模态框过渡效果 */
.fade-in-enter-active,
.fade-in-leave-active {
    transition: opacity 0.3s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
    opacity: 0;
}

.fade-in-enter-active .clear-modal,
.fade-in-leave-active .clear-modal {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-in-enter-from .clear-modal,
.fade-in-leave-to .clear-modal {
    transform: scale(0.9);
}
</style>