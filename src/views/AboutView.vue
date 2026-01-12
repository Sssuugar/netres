<script setup>
import { ref, onMounted, nextTick } from 'vue';

// ------------------------------------
// 模拟全局状态
// ------------------------------------
const isAuthReady = ref(true); 

// 修正：使用更兼容的 Math.random 和 Date.now 组合来生成 ID
const generateUniqueId = () => 
    'guest-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const userId = ref(generateUniqueId()); 

// 模拟作者简介数据
const authorProfile = ref({
  name: 'Sssuugar', 
  title: '前端爱好者', 
  bio: '欢迎来到我的数字角落。', 
  social: [
    { platform: 'GitHub', url: 'https://github.com/yourprofile' },
    { platform: 'Twitter', url: 'https://twitter.com/yourprofile' },
    { platform: 'Email', url: 'mailto:your@example.com' },
  ]
});

// 模拟写作作品列表数据 (替换文章列表)
const articles = ref([
  { id: 1, title: '《大压抑时代》', date: '2025年11月20日', tags: ['随笔', '管理'], content: '《大压抑时代》认为，当代社会形成了一种系统性的压抑，它将本应是出口的通道（性、工作、消费）转化为压力源 。人们在其中出售时间、进行“报复性消费”以试图赎回生命 ，将“捡便宜”视为廉价的权力感 ，并用低质量的忙碌来逃避终极问题的思考 。社会崇拜“结果” ，加速了精神倦怠 ，并使得人们将自身的价值与物化的符号（如昂贵的汽车 、婚恋条件 ）强行捆绑。在这种大压抑下，追求财富成为唯一的“删除”窒息感的幻觉 ，而真正的反叛，是重拾“慢”的勇气，敢于停顿下来，审视方向 。' },
]);

// 卡通形象 SVG (已压缩空格)
const CARTOON_AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10" fill="#FFE3A8"/>
<path d="M7 16C7 16 9 14 12 14C15 14 17 16 17 16" stroke="#C45A3F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#000000"/>
<ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#000000"/>
<path d="M10 18H14" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
<path d="M12 4C8.68629 4 6 6.68629 6 10C6 11.7709 6.84568 13.3444 8.16782 14.3916C8.82607 14.9126 9.58782 15.3407 10.4284 15.6669C11.1963 15.9616 11.7583 16.1408 12 16.214C12.2417 16.1408 12.8037 15.9616 13.5716 15.6669C14.4122 15.3407 15.1739 14.9126 15.8322 14.3916C17.1543 13.3444 18 11.7709 18 10C18 6.68629 15.3137 4 12 4Z" stroke="#4A90E2" stroke-width="1" fill="rgba(74, 144, 226, 0.1)"/>
</svg>`;

// ------------------------------------
// 模拟留言板逻辑
// ------------------------------------
const initialComments = [
  { id: 'mock-1', text: '你好！这个页面设计得真有 macOS 风格！', userId: 'mock-visitor-a', timestamp: Date.now() - 300000, colorHash: 'ff9933' },
  { id: 'mock-2', text: '文章列表看起来很赞，特别是关于 Composition API 的那篇。', userId: 'mock-visitor-b', timestamp: Date.now() - 180000, colorHash: '00aaff' },
  { id: 'mock-3', text: '请问有兴趣合作开发一个 Tailwind CSS 教程吗？', userId: 'mock-visitor-a', timestamp: Date.now() - 60000, colorHash: 'ff9933' },
];

const comments = ref(initialComments);
const newCommentText = ref('');
const messagesWindow = ref(null); 

let commentIdCounter = initialComments.length + 1;

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesWindow.value) {
      messagesWindow.value.scrollTop = messagesWindow.value.scrollHeight;
    }
  });
};

const mockBotReply = () => {
  const botMessages = [
    "感谢您的留言！我会尽快回复的。",
    "有趣的问题，我会考虑在下一篇文章中深入探讨！",
    "欢迎来到我的博客，希望您在这里有所收获。",
    "保持学习，保持好奇心！"
  ];

  if (Math.random() < 0.3) {
    const botText = botMessages[Math.floor(Math.random() * botMessages.length)];
    const newComment = {
      id: 'mock-' + (commentIdCounter++),
      text: botText,
      userId: 'mock-bot',
      timestamp: Date.now(),
      colorHash: 'FF00FF'
    };
    comments.value.push(newComment);
    comments.value.sort((a, b) => a.timestamp - b.timestamp);
    scrollToBottom();
  }
};

const sendComment = async () => {
  if (!newCommentText.value.trim() || !isAuthReady.value) return;

  const newComment = {
    id: 'mock-' + (commentIdCounter++),
    text: newCommentText.value.trim(),
    userId: userId.value,
    timestamp: Date.now(),
    // 简单的颜色哈希生成逻辑，基于 userId
    colorHash: userId.value.length > 5 
               ? Math.floor(parseInt(userId.value.replace(/\D/g, '').substring(0, 5) || '1', 10) * 16777215 / 1000000).toString(16).padStart(6, '0') 
               : '00FFFF'
  };

  comments.value.push(newComment);
  comments.value.sort((a, b) => a.timestamp - b.timestamp);
  newCommentText.value = '';
  scrollToBottom();

  setTimeout(mockBotReply, 3000);
};

const getCommentProps = (comment) => {
    let senderName = '';
    let color = '#' + comment.colorHash;
    let isSelf = false;

    if (comment.userId === userId.value) {
        senderName = `You (${authorProfile.value.name})`; 
        isSelf = true;
    } else if (comment.userId === 'mock-bot') {
        senderName = 'Bot-Assistant';
        color = '#FF00FF';
    } else {
        senderName = `Visitor-${comment.userId.substring(comment.userId.length - 4)}`;
    }

    return { senderName, color, isSelf };
};

// ------------------------------------
// 作品弹出层逻辑
// ------------------------------------
const showModal = ref(false);
const selectedWork = ref(null);

const openModal = (work) => {
    selectedWork.value = { 
        id: work.id, 
        title: work.title, 
        content: work.content 
    }; 
    showModal.value = true;
    document.body.style.overflow = 'hidden';
};

const closeModal = () => {
    showModal.value = false;
    selectedWork.value = null;
    document.body.style.overflow = '';
};


onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="about-page">
    <div class="background-gradient"></div>
    <div class="background-dots"></div>

    <div class="content-wrapper">
      
      <div class="left-column">
          <div class="profile-card">
              <div class="avatar-area">
                <div class="avatar-svg-container" v-html="CARTOON_AVATAR_SVG"></div>
                <div class="name-title">
                  <h2 class="author-name">{{ authorProfile.name }}</h2>
                  <p class="author-title">{{ authorProfile.title }}</p>
                </div>
              </div>
              
              <p class="author-bio">{{ authorProfile.bio }}</p>

              <div class="social-links">
                <a v-for="link in authorProfile.social" :key="link.platform" :href="link.url" target="_blank" class="social-link">
                  {{ link.platform }}
                </a>
              </div>
          </div>

          <h3 class="section-title">我的写作作品 ({{ articles.length }})</h3>
          
          <div class="article-list">
              <div 
                v-for="article in articles" 
                :key="article.id" 
                class="article-item"
                @click="openModal(article)"
              >
                  <div class="article-header">
                      <span class="article-date">{{ article.date }}</span>
                      <div class="tags">
                          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
                      </div>
                  </div>
                  <h4 class="article-title">{{ article.title }}</h4>
                  <span class="read-more">点击查看摘要 →</span>
              </div>
          </div>
      </div>
      
      <div class="right-column">
        <div class="terminal-card">
          <div class="terminal-header">
            <div class="terminal-controls">
              <span class="control-dot red"></span>
              <span class="control-dot yellow"></span>
              <span class="control-dot green"></span>
            </div>
            <div class="terminal-title">
              <span class="icon">💬</span> 访客留言板 
            </div>
          </div>
          
          <div ref="messagesWindow" class="messages-window">
            <div v-if="!isAuthReady" class="loading-message">
                <p>正在连接本地状态... 🚀</p>
            </div>
            <div v-else-if="comments.length === 0" class="empty-message">
                <p>本地留言为空。请留下您的第一条信息！</p>
            </div>
            <div 
              v-else
              v-for="comment in comments" 
              :key="comment.id" 
              class="message-line"
              :class="{ 'self-message': getCommentProps(comment).isSelf }"
            >
              <span class="timestamp">[{{ new Date(comment.timestamp).toLocaleTimeString() }}]</span>
              <span 
                class="sender" 
                :style="{ color: getCommentProps(comment).color }"
              >
                {{ getCommentProps(comment).senderName }}
              </span>
              <span class="colon">:</span>
              <span class="text">{{ comment.text }}</span>
            </div>
          </div>
          
          <form @submit.prevent="sendComment" class="input-line-container">
            <label for="comment-input" class="prompt-text">$ message ></label>
            <input 
              id="comment-input"
              v-model="newCommentText"
              :disabled="!isAuthReady"
              placeholder="输入您的留言..."
              class="input-terminal"
            >
            <button type="submit" class="send-button" :disabled="!isAuthReady || !newCommentText.trim()">
                发送
            </button>
          </form>
        </div>
      </div>

    <Transition name="fade">
        <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
            <div class="modal-content">
                <button class="modal-close" @click="closeModal">×</button>
                <div class="modal-header">
                    <h3>{{ selectedWork.title }}</h3>
                    <div class="modal-separator"></div>
                </div>
                <div class="modal-body">
                    <p>{{ selectedWork.content }}</p>
                    <p class="modal-note">（以上为作品摘要。）</p>
                </div>
            </div>
        </div>
    </Transition>
    
    </div>
  </div>
</template>

<style scoped>
/* ---------------------------------- */
/* 整体页面布局 */
/* ---------------------------------- */
.about-page {
  position: fixed;
  top: 34px; 
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto; 
  padding: 50px 0 120px 0; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.content-wrapper {
  z-index: 1;
  width: 95%; 
  max-width: 1200px; 
  display: grid;
  grid-template-columns: 2fr 1fr; 
  gap: 30px;
}

.left-column {
    display: flex;
    flex-direction: column;
    gap: 30px;
    min-width: 300px; 
}

.right-column {
    position: sticky;
    top: 50px; 
    height: auto; 
    min-height: 400px;
}

/* ---------------------------------- */
/* 背景复用 (与 HomeView 保持一致) */
/* ---------------------------------- */
.background-gradient {
  position: fixed; 
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: 
    linear-gradient(45deg, rgba(255,100,100,0.5), rgba(100,100,255,0.5)),
    linear-gradient(-45deg, rgba(100,255,100,0.5), rgba(255,255,100,0.5));
  background-size: 200% 200%;
  animation: colorShift 20s ease infinite alternate, gradientPan 40s linear infinite;
  filter: blur(80px);
  opacity: 0.8;
  z-index: -2;
}
@keyframes colorShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes gradientPan {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.05) rotate(5deg); }
  50% { transform: scale(1) rotate(0deg); }
  75% { transform: scale(0.95) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.background-dots {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: dotMove 100s linear infinite;
  opacity: 0.3;
  z-index: -1;
}
@keyframes dotMove {
  from { background-position: 0 0; }
  to { background-position: 100% 100%; }
}

/* ---------------------------------- */
/* 1. 作者简介卡片 (Profile Card) */
/* ---------------------------------- */
.profile-card {
  background: rgba(255, 255, 255, 0.75); 
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  padding: 30px;
  margin-top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
}

.avatar-area {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.avatar-svg-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20px;
    box-shadow: 0 0 0 3px #4A90E2, 0 0 15px rgba(74, 144, 226, 0.5); 
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-svg-container svg {
    width: 100%;
    height: 100%;
}

.author-name {
    font-size: 2em;
    font-weight: 700;
    color: #222;
    margin: 0;
}

.author-title {
    font-size: 1.1em;
    font-weight: 400;
    color: #666;
    margin-top: 5px;
}

.author-bio {
    font-size: 1.05em;
    line-height: 1.6;
    color: #444;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-link {
    text-decoration: none;
    color: #4A90E2;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 8px;
    transition: background-color 0.2s, color 0.2s;
}

.social-link:hover {
    background-color: #4A90E2;
    color: white;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
}

/* ---------------------------------- */
/* 2. 写作作品列表区域 (Works List) */
/* ---------------------------------- */
.section-title {
    font-size: 1.5em;
    font-weight: 600;
    color: #222;
    margin-bottom: 10px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.article-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.article-item {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(15px);
    border-radius: 12px;
    padding: 20px 25px;
    cursor: pointer;
    border-left: 5px solid transparent;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.article-item:hover {
    border-left: 5px solid #4A90E2;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.article-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.article-date {
    font-size: 0.9em;
    color: #999;
}

.tags {
    display: flex;
    gap: 8px;
}

.tag {
    font-size: 0.8em;
    font-weight: 500;
    color: #4A90E2;
    background-color: rgba(74, 144, 226, 0.1);
    padding: 3px 8px;
    border-radius: 5px;
}

.article-title {
    font-size: 1.25em;
    font-weight: 600;
    color: #333;
    margin: 0;
    line-height: 1.4;
}

.read-more {
    display: block;
    margin-top: 10px;
    font-size: 0.95em;
    color: #4A90E2;
    font-weight: 500;
}

/* ---------------------------------- */
/* 3. 终端留言板样式 (Terminal Card) */
/* ---------------------------------- */
.terminal-card {
  height: 100%;
  background: rgba(0, 0, 0, 0.85); 
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  color: #00FF00; 
  font-family: 'Consolas', 'Monaco', monospace;
  border: 1px solid rgba(13, 255, 13, 0.2);
  overflow: hidden;
}

.terminal-header {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.95);
  border-bottom: 1px solid #333;
}

.terminal-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.red { background-color: #ff5f56; }
.yellow { background-color: #ffbd2e; }
.green { background-color: #27c93f; }

.terminal-title {
    font-size: 0.9em;
    color: #bbb;
    font-weight: 500;
}

.messages-window {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  font-size: 0.9em;
  line-height: 1.5;
  white-space: pre-wrap; 
  scrollbar-width: thin; 
  scrollbar-color: #00FF00 #333; 
}

.messages-window::-webkit-scrollbar {
  width: 8px;
}

.messages-window::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.messages-window::-webkit-scrollbar-thumb {
  background-color: #00FF00;
  border-radius: 4px;
}

.message-line {
  margin-bottom: 5px;
  color: #00FF00;
}

.message-line .timestamp {
    color: #888;
    margin-right: 8px;
}

.message-line .sender {
    font-weight: bold;
    text-shadow: 0 0 2px rgba(0, 255, 0, 0.5);
}

.message-line .colon {
    margin-right: 5px;
}

.self-message {
    font-weight: 500;
    color: #66FF66;
}
.self-message .sender {
    color: #00FFFF !important; 
    text-shadow: 0 0 2px rgba(0, 255, 255, 0.5);
}

.input-line-container {
  padding: 10px 15px;
  border-top: 1px solid #333;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
}

.prompt-text {
  color: #FFFF00; 
  margin-right: 10px;
  user-select: none;
}

.input-terminal {
  flex-grow: 1;
  background: transparent;
  border: none;
  color: #00FF00;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  outline: none;
  padding: 5px 0;
}

.input-terminal::placeholder {
    color: rgba(0, 255, 0, 0.5);
}

.send-button {
    background-color: #00FF00;
    color: #000;
    border: none;
    padding: 5px 12px;
    margin-left: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
    background-color: #66FF66;
    box-shadow: 0 0 8px #00FF00;
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading-message, .empty-message {
    color: #AAAAAA;
    text-align: center;
    padding: 20px;
}

/* ---------------------------------- */
/* 4. 新增：作品弹出层样式 (Modal) */
/* ---------------------------------- */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.modal-content {
    background: rgba(255, 255, 255, 0.95); 
    backdrop-filter: blur(30px) saturate(180%);
    border-radius: 20px;
    padding: 30px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    position: relative;
    color: #333;
    animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(255, 255, 255, 0.9);
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #ff5f56;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 1.2em;
    cursor: pointer;
    transition: background-color 0.2s;
    line-height: 1;
}

.modal-close:hover {
    background: #ff8c86;
}

.modal-header h3 {
    font-size: 1.8em;
    font-weight: 700;
    color: #4A90E2;
    margin: 0;
    margin-right: 40px;
}

.modal-separator {
    height: 3px;
    width: 50px;
    background: #4A90E2;
    margin: 10px 0 20px 0;
    border-radius: 2px;
}

.modal-body p {
    font-size: 1.05em;
    line-height: 1.7;
    margin-bottom: 20px;
    color: #444;
}

.modal-note {
    font-size: 0.9em;
    color: #999;
    border-top: 1px dashed #ddd;
    padding-top: 10px;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes bounceIn {
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}


/* 媒体查询：适配移动设备 */
@media (max-width: 1024px) {
    .content-wrapper {
        grid-template-columns: 1fr; 
        width: 90%;
        max-width: 800px;
    }
    .left-column {
        order: 1; 
    }
    .right-column {
        order: 2; 
        position: relative; 
        height: 500px; 
        margin-bottom: 50px;
    }
    .profile-card {
        padding: 20px;
    }
    .avatar-area {
        flex-direction: column;
        text-align: center;
    }
    .avatar-svg-container {
        margin: 0 0 15px 0;
    }
    .author-name {
        font-size: 1.5em;
    }
    .author-title {
        font-size: 1em;
    }
    .article-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style>