<template>
  <div class="macos-app-wrapper">
    <div class="app-window">
      <header class="window-header">
        <div class="window-controls">
          <span class="control close" title="关闭"></span>
          <span class="control minimize" title="最小化"></span>
          <span class="control maximize" title="最大化"></span>
        </div>
        <h3 class="window-title">👤 像素头像生成器</h3>
      </header>

      <div class="app-content">
        
        <div class="sidebar">
          <div class="sidebar-card">
            <p class="sidebar-title">📸 当前头像属性</p>
            <ul class="attribute-list">
              <li v-for="attr in attributes" :key="attr.trait_type">
                <span class="trait-type">{{ attr.trait_type }}:</span> 
                <strong class="trait-value">{{ attr.value }}</strong>
              </li>
            </ul>
          </div>
        </div>

        <div class="main-view">
          <h1 class="main-title">模块化 NFT 像素头像</h1>
          
          <div class="canvas-container">
            <canvas ref="avatarCanvas" width="256" height="256"></canvas>
          </div>

          <div class="control-panel">
            <div class="input-area">
              <label for="seedInput">输入种子字符串:</label>
              <input 
                id="seedInput"
                v-model="inputSeed" 
                @input="generatePixelAvatar" 
                placeholder="输入用户名或任意字符串"
                class="seed-input"
              >
            </div>
          
            <button @click="generatePixelAvatar" class="generate-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-refresh"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.52 14c1.25-5.32 5.3-9.47 10.38-9.47 4.96 0 8.92 3.86 10.15 9"></path></svg>
              推算/生成头像
            </button>
          </div>

          <p class="status-tip">💡 **当前种子:** <code>{{ inputSeed || '请在上方输入框输入' }}</code></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SolidHumanPixelAvatarGeneratorWithBody',
  data() {
    return {
      dataUrl: '',
      inputSeed: '', 
      attributes: [], 
    };
  },
  mounted() {
    // 默认生成一个头像
    this.generatePixelAvatar();
  },
  methods: {
    stringToNumberSeed(str) {
      if (!str || str.length === 0) { return 1; }
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
      }
      return Math.abs(hash); 
    },

    drawPixel(ctx, x, y, scale, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
    },

    // 核心：所有模块的像素点阵定义和选择
    getTraits(seededRandom, colors) {
        
        // 1. 身体基底 (BodyBase) - 肩膀到胸部
        const BodyBase = [
            { name: "Default Body",
                pixels: [
                    [4,13],[11,13], 
                    [3,14],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14], 
                    [3,15],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15]
                ]
            }
        ];

        // 2. 脖子模块 (Neck)
        const Neck = [
            { name: "Normal Neck", pixels: [[7,11],[8,11],[7,12],[8,12]] }
        ];

        // 3. 脸部形状 (Face)
        const Face = [
            { 
                name: "Round Face",
                pixels: [
                    [5,2],[6,2],[7,2],[8,2],[9,2],[10,2], 
                    [4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],
                    [4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],
                    [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
                    [4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],
                    [4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],
                    [5,8],[6,8],[7,8],[8,8],[9,8],[10,8],
                    [6,9],[7,9],[8,9],[9,9],
                    [7,10],[8,10] 
                ],
                shadePixels: [[4,6],[11,6],[7,10]]
            }
        ];
        
        // 4. 头发/帽子模块 (Headwear)
        const Headwear = [
            { name: "None", pixels: [] }, 
            { name: "Short Top", 
                pixels: [
                    [6,1],[7,1],[8,1],[9,1], 
                    [5,2],[6,2],[7,2],[8,2],[9,2],[10,2], 
                    [4,3],[11,3]
                ]
            }, 
            { name: "Afro", 
                pixels: [
                    [5,0],[6,0],[7,0],[8,0],[9,0],[10,0],
                    [4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],
                    [3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],
                    [3,3],[12,3]
                ]
            },
            { name: "Beanie", 
                pixels: [
                    [4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],
                    [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],
                    [3,2],[12,2]
                ]
            }
        ];
        
        // 5. 眼睛模块 (Eyes)
        const Eyes = [
            { name: "Default Eyes", 
                whitePixels: [[5,5],[10,5]], 
                pupilPixels: [[6,6],[9,6]] 
            },
            { name: "Wink", 
                whitePixels: [],
                pupilPixels: [[5,6],[6,6],[9,6],[10,6]] 
            },
            { name: "Shades", 
                whitePixels: [],
                pupilPixels: [
                    [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
                    [4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6]
                ]
            }
        ];

        // 6. 鼻子模块 (Nose)
        const Nose = [
            { name: "Small Nose", pixels: [[7,7]] } 
        ];
        
        // 7. 嘴巴模块 (Mouth)
        const Mouth = [
            { name: "Smile", pixels: [[6,8],[7,8],[8,8],[9,8]] }, 
            { name: "Frown", pixels: [[6,9],[7,9],[8,9],[9,9]] }, 
            { name: "Open Mouth", pixels: [[7,8],[8,8],[7,9],[8,9]] } 
        ];

        // 8. 服装模块 (Clothes)
        const Clothes = [
            { name: "Naked", pixels: [] }, 
            { name: "T-Shirt", 
                pixels: [
                    [4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13], 
                    [3,14],[12,14], 
                    [3,15],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15]
                ],
                color: colors.CLOTHES_COLORS[Math.floor(seededRandom() * colors.CLOTHES_COLORS.length)]
            },
            { name: "Strap Top", 
                pixels: [
                    [6,13],[9,13], 
                    [4,14],[11,14], 
                    [3,15],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15]
                ],
                color: colors.CLOTHES_COLORS[Math.floor(seededRandom() * colors.CLOTHES_COLORS.length)]
            },
            { name: "Shirt", 
                pixels: [
                    [5,12],[6,12],[9,12],[10,12], 
                    [4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13], 
                    [3,14],[12,14], 
                    [3,15],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15]
                ],
                color: colors.CLOTHES_COLORS[Math.floor(seededRandom() * colors.CLOTHES_COLORS.length)]
            }
        ];

        // 9. 配饰模块 (Accessory) - 可选
        const Accessory = [
            { name: "None", pixels: [] }, 
            { name: "Earring", pixels: [[3,6]] }, 
            { name: "Beard", pixels: [[6,9],[9,9],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10]] } 
        ];


        // 确定性选择
        const selectedBodyBase = BodyBase[0]; 
        const selectedNeck = Neck[0]; 
        const selectedFace = Face[0]; 
        const selectedHeadwear = Headwear[Math.floor(seededRandom() * Headwear.length)];
        const selectedEyes = Eyes[Math.floor(seededRandom() * Eyes.length)];
        const selectedNose = Nose[Math.floor(seededRandom() * Nose.length)];
        const selectedMouth = Mouth[Math.floor(seededRandom() * Mouth.length)];
        const selectedClothes = Clothes[Math.floor(seededRandom() * Clothes.length)]; 
        const selectedAccessory = Accessory[Math.floor(seededRandom() * Accessory.length)];
        
        // 确定颜色
        const bgColor = colors.BACKGROUND_COLORS[Math.floor(seededRandom() * colors.BACKGROUND_COLORS.length)];
        const skinColorIndex = Math.floor(seededRandom() * colors.SKIN_COLORS.length);
        const skinColor = colors.SKIN_COLORS[skinColorIndex];
        const skinShadeColor = colors.SKIN_SHADE_COLORS[skinColorIndex]; 
        const eyeColor = colors.EYE_COLORS[Math.floor(seededRandom() * colors.EYE_COLORS.length)];
        const hairColor = colors.HAIR_COLORS[Math.floor(seededRandom() * colors.HAIR_COLORS.length)];
        const mouthColor = colors.MOUTH_COLORS[Math.floor(seededRandom() * colors.MOUTH_COLORS.length)];
        const accessoryColor = colors.ACCESSORY_COLORS[Math.floor(seededRandom() * colors.ACCESSORY_COLORS.length)];

        const clothesColor = selectedClothes.color || colors.CLOTHES_COLORS[Math.floor(seededRandom() * colors.CLOTHES_COLORS.length)];


        return {
            Background: { color: bgColor },
            BodyBase: { module: selectedBodyBase, color: skinColor }, 
            Neck: { module: selectedNeck, color: skinColor, shade: skinShadeColor }, 
            Face: { module: selectedFace, color: skinColor, shade: skinShadeColor },
            Headwear: { module: selectedHeadwear, color: hairColor },
            Eyes: { module: selectedEyes, color: eyeColor, whiteColor: colors.EYE_WHITE_COLOR },
            Nose: { module: selectedNose, color: skinColor }, 
            Mouth: { module: selectedMouth, color: mouthColor },
            Clothes: { module: selectedClothes, color: clothesColor }, 
            Accessory: { module: selectedAccessory, color: accessoryColor }
        };
    },

    generatePixelAvatar() {
      // 1. 种子和随机数生成器初始化
      const stringValue = this.inputSeed;
      let numericSeed = this.stringToNumberSeed(stringValue);
      if (numericSeed === 0) { numericSeed = 1; }
      let seed = numericSeed; 
      function seededRandom() {
          seed = (seed * 1664525 + 1013904223) % 4294967296; 
          return seed / 4294967296; 
      }
      
      const CANVAS_SIZE = 256;
      const PIXEL_COUNT = 16;
      const PIXEL_SCALE = CANVAS_SIZE / PIXEL_COUNT; 

      const canvas = this.$refs.avatarCanvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      // 2. 定义颜色池 
      const colors = {
          BACKGROUND_COLORS: ["#f0f8ff", "#e6e6fa", "#fff0f5", "#fae8f0"],
          SKIN_COLORS: ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642"], 
          SKIN_SHADE_COLORS: ["#e0c89a", "#d3ae6f", "#c0975e", "#a8773c"], 
          EYE_COLORS: ["#000000", "#1e90ff", "#008000"],
          EYE_WHITE_COLOR: "#ffffff",
          MOUTH_COLORS: ["#8b0000", "#dc143c"], 
          HAIR_COLORS: ["#000000", "#8b4513", "#ffd700"],
          ACCESSORY_COLORS: ["#ffd700", "#00ced1", "#ff00ff"],
          CLOTHES_COLORS: ["#87ceeb", "#90ee90", "#ffb6c1", "#dda0dd", "#a9a9a9"] 
      };

      // 3. 获取所有选定的模块和属性
      const selectedTraits = this.getTraits(seededRandom, colors);
      
      // 4. 开始绘制 (分层绘制确保覆盖顺序正确)
      
      // 4.1 背景 (最底层)
      ctx.fillStyle = selectedTraits.Background.color;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 4.2 身体基底 (BodyBase)
      selectedTraits.BodyBase.module.pixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.BodyBase.color);
      });
      // 身体阴影
      this.drawPixel(ctx, 6, 14, PIXEL_SCALE, selectedTraits.Face.shade); 
      this.drawPixel(ctx, 9, 14, PIXEL_SCALE, selectedTraits.Face.shade);


      // 4.3 脖子 (Neck)
      selectedTraits.Neck.module.pixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.Neck.color);
      });
      // 脖子阴影
      this.drawPixel(ctx, 7, 12, PIXEL_SCALE, selectedTraits.Neck.shade);


      // 4.4 脸部基底 (Face)
      selectedTraits.Face.module.pixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.Face.color);
      });
      // 脸部阴影
      selectedTraits.Face.module.shadePixels?.forEach(([x,y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.Face.shade);
      });


      // 4.5 头发/帽子 (Headwear) 
      selectedTraits.Headwear.module.pixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.Headwear.color);
      });

      // 4.6 鼻子 (Nose)
      selectedTraits.Nose.module.pixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.Face.shade); 
      });

      // 4.7 嘴巴 (Mouth)
      const mouthTraits = selectedTraits.Mouth;
      mouthTraits.module.pixels?.forEach(([x, y]) => {
          let color = mouthTraits.color;
          if (mouthTraits.module.name === "Open Mouth") { 
              color = colors.MOUTH_COLORS[1]; 
          }
          this.drawPixel(ctx, x, y, PIXEL_SCALE, color);
      });

      // 4.8 眼睛 (Eyes)
      const eyeTraits = selectedTraits.Eyes;
      const traitName = eyeTraits.module.name;

      eyeTraits.module.whitePixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, eyeTraits.whiteColor);
      });
      eyeTraits.module.pupilPixels?.forEach(([x, y]) => {
          let color = eyeTraits.color;
          if (traitName === "Shades") {
              color = selectedTraits.Accessory.color; 
          } else if (traitName === "Wink") {
              color = selectedTraits.Face.shade; 
          }
          this.drawPixel(ctx, x, y, PIXEL_SCALE, color);
      });

      // 4.9 服装 (Clothes)
      selectedTraits.Clothes.module.pixels?.forEach(([x, y]) => {
          this.drawPixel(ctx, x, y, PIXEL_SCALE, selectedTraits.Clothes.color);
      });


      // 4.10 配饰 (Accessory) 
      selectedTraits.Accessory.module.pixels?.forEach(([x, y]) => {
          let color = selectedTraits.Accessory.color;
          if (selectedTraits.Accessory.module.name === "Beard") {
              color = selectedTraits.Headwear.color;
          }
          this.drawPixel(ctx, x, y, PIXEL_SCALE, color);
      });


      // 5. 导出和设置属性
      this.dataUrl = canvas.toDataURL('image/png');
      
      // 设置中文属性列表
      this.attributes = [
          { trait_type: "背景", value: selectedTraits.Background.color },
          { trait_type: "脸型", value: selectedTraits.Face.module.name },
          { trait_type: "肤色", value: selectedTraits.Face.color },
          { trait_type: "头部饰品", value: selectedTraits.Headwear.module.name === 'None' ? '无' : selectedTraits.Headwear.module.name },
          { trait_type: "眼睛", value: selectedTraits.Eyes.module.name },
          { trait_type: "鼻子", value: selectedTraits.Nose.module.name },
          { trait_type: "嘴巴", value: selectedTraits.Mouth.module.name },
          { trait_type: "服装", value: selectedTraits.Clothes.module.name === 'Naked' ? '赤裸' : selectedTraits.Clothes.module.name }, 
          { trait_type: "配饰", value: selectedTraits.Accessory.module.name === 'None' ? '无' : selectedTraits.Accessory.module.name }
      ];
    }
  }
};
</script>

<style>
/* 全局样式重置 */
body {
  margin: 0;
  padding: 0;
  background-color: #f7f7f7; 
  display: flex;
  justify-content: center;
  align-items: center; 
  min-height: 100vh; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
/* ==================================================================== */
/* === macOS 风格样式 (修正留白和细节优化) === */
/* ==================================================================== */

/* 整体容器和字体设置 */
.macos-app-wrapper {
  background-color: #f7f7f7; 
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  padding: 40px 20px; /* 上下左右填充，让内容有呼吸空间 */
  padding-top: 40px; 
  min-height: auto; /* 关键：根据内容收缩 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  color: #1c1c1c;
}

/* 1. 窗口样式 (App Window) */
.app-window {
  width: 850px;
  max-width: 95%;
  background-color: #ffffff;
  border-radius: 12px; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 2. 窗口头部 */
.window-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ededed;
  position: relative;
  padding: 0 10px;
}

.window-title {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin: 0;
}

.window-controls {
  position: absolute;
  left: 10px;
  display: flex;
  gap: 7px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}
.close { background-color: #ff5f56; }
.minimize { background-color: #ffbd2e; }
.maximize { background-color: #27c93f; }

/* 3. 应用内容布局 */
.app-content {
  display: flex;
  flex-grow: 1;
  min-height: 500px; 
}

/* 4. 左侧边栏 (Sidebar - 使用模糊效果) */
.sidebar {
  width: 250px;
  padding: 15px;
  background-color: rgba(245, 245, 245, 0.85); 
  border-right: 1px solid #e0e0e0;
  backdrop-filter: blur(10px); 
  -webkit-backdrop-filter: blur(10px);
}

.sidebar-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #444;
  margin-top: 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #f0f0f0;
}

.attribute-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.attribute-list li {
  font-size: 12px;
  padding: 4px 0;
  display: flex;
  justify-content: space-between;
}

.trait-type {
  color: #666;
  font-weight: 500;
}
.trait-value {
  font-weight: 600;
  color: #1c1c1c;
}

/* 5. 主内容区域 */
.main-view {
  flex-grow: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 30px;
}

/* 6. Canvas 样式 */
.canvas-container {
    margin-bottom: 30px;
}

canvas {
 width: 256px; 
 height: 256px;
 border: 1px solid #d0d0d0; 
 border-radius: 8px; 
 image-rendering: pixelated; 
 background-color: #ffffff;
 box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 7. 控制面板 (Input & Button) */
.control-panel {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  width: 100%;
  max-width: 450px;
}

.input-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-area label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.seed-input {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px; 
  font-size: 14px;
  color: #1c1c1c;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.seed-input:focus {
  border-color: #007aff; 
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.generate-button {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: #007aff; 
  color: white;
  border: none;
  border-radius: 6px; 
  transition: background-color 0.15s, opacity 0.15s, transform 0.1s;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 40px; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.generate-button:hover {
 background-color: #006ddb;
}

.generate-button:active {
  transform: scale(0.98);
}

.icon-refresh {
  width: 18px;
  height: 18px;
}

.status-tip {
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 0; 
}

.status-tip code {
  background-color: #e8e8e8;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
</style>