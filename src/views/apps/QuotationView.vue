<script setup>
import { reactive, computed, watch, onMounted, ref } from 'vue';
import { 
  Printer, 
  Share2, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Building, 
  Calculator,
  RefreshCcw,
  ChevronDown,
  Settings,
  Type,
  CheckCircle2,
  Copy,
  PenSquare,
  Palette,
  LayoutTemplate
} from 'lucide-vue-next';

// --- 配置区域 ---
const STORAGE_KEY = 'vue_quote_system_v15_custom_labels';

// 生成 TSSR-yyyyMMdd-001 格式的单号
const generateQuoteNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `TSSR-${year}${month}${day}-001`;
};

// --- 状态管理 ---
const isReadOnly = ref(false); 

const defaultData = {
  content: {
    companyName: "未来科技有限公司",
    // --- DIY Logo 数据 ---
    logoFontSize: 32, 
    logoIsBold: true, 
    logoIsItalic: false, 
    logoColor: "#0f172a", 
    // -----------------------
    companyAddress: "北京市海淀区科技园路88号",
    companyPhone: "010-12345678",
    companyEmail: "contact@futuretech.com",
    customerName: "某某集团采购部",
    customerContact: "张经理",
    customerPhone: "13800138000",
    customerAddress: "上海市浦东新区陆家嘴环路100号",
    
    quoteNumber: generateQuoteNumber(), 
    date: new Date().toISOString().split('T')[0],
    
    currencySymbol: "¥",
    taxRate: 6,
    salesName: "李销售",
    salesPhone: "13912345678", // 新增字段
    salesEmail: "sales.li@futuretech.com", // 新增字段
    items: [
      { id: 1, name: "企业级服务器配置", description: "32核CPU, 128G内存, 4T SSD", quantity: 2, price: 15000, unit: "台" },
      { id: 2, name: "系统部署服务", description: "上门安装调试及基础培训", quantity: 1, price: 5000, unit: "次" },
      { id: 3, name: "年度维保服务", description: "7x24小时远程支持", quantity: 1, price: 3000, unit: "年" },
      { id: 4, name: "数据库优化", description: "Oracle/MySQL性能调优", quantity: 1, price: 8000, unit: "次" },
      { id: 5, name: "网络安全加固", description: "防火墙策略配置与漏洞扫描", quantity: 1, price: 12000, unit: "项" },
    ],
    notes: "1. 以上报价含税。\n2. 交付周期为合同签订后15个工作日。",
    terms: "付款方式：预付50%，验收合格后付50%。"
  },
  labels: {
    // 顶部标题
    titleMain: "报价单",
    titleSub: "QUOTATION",
    // 联系方式前缀
    prefixPhone: "电话",
    prefixEmail: "邮箱",
    prefixQuoteNo: "单号",
    prefixDate: "报价日期",
    // 区域标题
    headerBillTo: "客户信息 (Bill To)",
    headerSales: "销售代表 (Sales Rep)",
    // 表格列名
    colIndex: "序号",
    colItem: "项目描述",
    colPrice: "单价",
    colQty: "数量",
    colTotal: "金额",
    // 底部统计
    labelSubtotal: "小计",
    labelTax: "税额",
    labelTotal: "总计",
    // 底部条款
    headerNotes: "备注",
    headerTerms: "条款",
    // 签字区
    signClient: "客户签字",
    signAuth: "授权盖章"
  }
};

const data = reactive(JSON.parse(JSON.stringify(defaultData)));
const shareStatus = reactive({ copied: false, text: '分享链接' });

// --- 编码与解码 ---
const encodeState = (obj) => {
  try {
    const jsonStr = JSON.stringify(obj);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.error('编码失败', e);
    return '';
  }
};

const decodeState = (str) => {
  try {
    const jsonStr = decodeURIComponent(atob(str));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('解码失败', e);
    return null;
  }
};

// --- 生命周期 ---
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const shareData = params.get('q');

  if (shareData) {
    const parsedData = decodeState(shareData);
    if (parsedData) {
      // 深度合并以防止新版本增加了字段而旧链接没有
      Object.assign(data.content, { ...defaultData.content, ...parsedData.content });
      Object.assign(data.labels, { ...defaultData.labels, ...parsedData.labels });
      isReadOnly.value = true; 
      return; 
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { 
      const parsedSaved = JSON.parse(saved);
      Object.assign(data.content, { ...defaultData.content, ...parsedSaved.content });
      Object.assign(data.labels, { ...defaultData.labels, ...parsedSaved.labels });
    } catch (e) { console.error(e); }
  }
});

watch(data, (newVal) => {
  if (!isReadOnly.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  }
  if (shareStatus.copied) {
    shareStatus.copied = false;
    shareStatus.text = '分享链接';
  }
}, { deep: true });

// --- 操作逻辑 ---
const resetData = () => {
  if(confirm('确定要重置所有数据吗？')) {
    const freshData = JSON.parse(JSON.stringify(defaultData));
    freshData.content.quoteNumber = generateQuoteNumber(); 
    
    Object.assign(data, freshData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
    window.history.pushState({}, '', window.location.pathname);
    isReadOnly.value = false;
  }
};

const forkQuote = () => {
  isReadOnly.value = false;
  window.history.replaceState({}, '', window.location.pathname);
  alert('已切换到编辑模式，您可以修改并保存这份报价单。');
};

const addItem = () => {
  const newId = data.content.items.length > 0 ? Math.max(...data.content.items.map(i => i.id)) + 1 : 1;
  data.content.items.push({ id: newId, name: "", description: "", quantity: 1, price: 0, unit: "个" });
};
const removeItem = (id) => data.content.items = data.content.items.filter(item => item.id !== id);

const subtotal = computed(() => data.content.items.reduce((acc, item) => acc + (item.quantity * item.price), 0));
const taxAmount = computed(() => subtotal.value * (data.content.taxRate / 100));
const total = computed(() => subtotal.value + taxAmount.value);
const formatMoney = (amount) => new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2 }).format(amount);

const handleShare = async () => {
  const payload = encodeState(data);
  if (!payload) return;
  const url = `${window.location.origin}${window.location.pathname}?q=${payload}`;
  try {
    await navigator.clipboard.writeText(url);
    shareStatus.copied = true;
    shareStatus.text = '链接已复制!';
    setTimeout(() => {
      shareStatus.copied = false;
      shareStatus.text = '分享链接';
    }, 3000);
  } catch (err) {
    alert('自动复制失败，链接已显示在地址栏，请手动复制。');
    window.history.pushState({}, '', `?q=${payload}`);
  }
};

// --- 打印逻辑 ---
const handlePrint = () => {
  const target = document.querySelector('.a4-page');
  if (!target) return;
  
  const clone = target.cloneNode(true);
  
  const originalInputs = target.querySelectorAll('input');
  const clonedInputs = clone.querySelectorAll('input');
  originalInputs.forEach((input, i) => {
    if (input.type === 'checkbox' || input.type === 'radio') clonedInputs[i].checked = input.checked;
    else clonedInputs[i].setAttribute('value', input.value);
  });

  const originalTextareas = target.querySelectorAll('textarea');
  const clonedTextareas = clone.querySelectorAll('textarea');
  originalTextareas.forEach((textarea, i) => {
    clonedTextareas[i].textContent = textarea.value;
    clonedTextareas[i].value = textarea.value; 
  });

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:100%; height:100%; border:none; z-index:-9999; visibility:hidden;';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;

  let stylesHtml = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => stylesHtml += node.outerHTML);

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>报价单-${data.content.quoteNumber}</title>
        ${stylesHtml}
        <style>
          html, body {
            height: auto !important;
            min-height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            display: block !important;
          }
          .a4-page {
            width: 100% !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            height: auto !important;
            display: block !important;
          }
          ::-webkit-scrollbar { display: none; }
          @media print {
            @page { size: A4; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            tr, td, .item-card, .total-row, .page-header, .page-footer, .totals-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    if(document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 5000);
};

// 默认展开的选项卡
const openSections = reactive({ company: false, customer: true, setting: true, items: true, terms: true, labels: false });
// 界面文本设置内部的折叠状态
const labelGroups = reactive({ titles: true, headers: false, columns: false, footer: false });

</script>

<template>
  <div class="app-container">
    <aside v-if="!isReadOnly" class="sidebar no-print">
      <div class="sidebar-header">
        <div class="title"><FileText :size="20" /> 编辑报价单</div>
        <button class="reset-btn" @click="resetData"><RefreshCcw :size="14" /> 重置</button>
      </div>

      <div class="sidebar-content">
        
        <!-- 界面文本设置 (增强版) -->
        <div class="accordion config-accordion">
          <div class="accordion-header" @click="openSections.labels = !openSections.labels">
            <span><Type :size="16"/> 界面文本自定义 (全部)</span>
            <ChevronDown :size="16" :class="{rotate: openSections.labels}" />
          </div>
          <div v-if="openSections.labels" class="accordion-body">
            
            <!-- 分组：主标题与前缀 -->
            <div class="label-group-header" @click="labelGroups.titles = !labelGroups.titles">
              <span>主标题与前缀</span>
              <ChevronDown :size="12" :class="{rotate: labelGroups.titles}" />
            </div>
            <div v-if="labelGroups.titles" class="label-group-body">
               <div class="grid-2">
                 <div class="form-group"><label>主标题</label><input v-model="data.labels.titleMain" /></div>
                 <div class="form-group"><label>副标题</label><input v-model="data.labels.titleSub" /></div>
               </div>
               <div class="grid-2">
                 <div class="form-group"><label>单号前缀</label><input v-model="data.labels.prefixQuoteNo" /></div>
                 <div class="form-group"><label>日期前缀</label><input v-model="data.labels.prefixDate" /></div>
               </div>
               <div class="grid-2">
                 <div class="form-group"><label>电话前缀</label><input v-model="data.labels.prefixPhone" /></div>
                 <div class="form-group"><label>邮箱前缀</label><input v-model="data.labels.prefixEmail" /></div>
               </div>
            </div>

            <!-- 分组：区域标题 -->
            <div class="label-group-header" @click="labelGroups.headers = !labelGroups.headers">
              <span>区域标题</span>
              <ChevronDown :size="12" :class="{rotate: labelGroups.headers}" />
            </div>
            <div v-if="labelGroups.headers" class="label-group-body">
              <div class="form-group"><label>客户信息标题</label><input v-model="data.labels.headerBillTo" /></div>
              <div class="form-group"><label>销售信息标题</label><input v-model="data.labels.headerSales" /></div>
            </div>

            <!-- 分组：表格列名 -->
            <div class="label-group-header" @click="labelGroups.columns = !labelGroups.columns">
              <span>表格列名</span>
              <ChevronDown :size="12" :class="{rotate: labelGroups.columns}" />
            </div>
            <div v-if="labelGroups.columns" class="label-group-body">
               <div class="grid-3">
                 <div class="form-group"><label>序号列</label><input v-model="data.labels.colIndex" /></div>
                 <div class="form-group"><label>数量列</label><input v-model="data.labels.colQty" /></div>
                 <div class="form-group"><label>单价列</label><input v-model="data.labels.colPrice" /></div>
               </div>
               <div class="grid-2">
                 <div class="form-group"><label>项目描述列</label><input v-model="data.labels.colItem" /></div>
                 <div class="form-group"><label>金额列</label><input v-model="data.labels.colTotal" /></div>
               </div>
            </div>

            <!-- 分组：底部统计与签字 -->
            <div class="label-group-header" @click="labelGroups.footer = !labelGroups.footer">
              <span>底部统计与签字</span>
              <ChevronDown :size="12" :class="{rotate: labelGroups.footer}" />
            </div>
            <div v-if="labelGroups.footer" class="label-group-body">
              <div class="grid-3">
                 <div class="form-group"><label>小计标签</label><input v-model="data.labels.labelSubtotal" /></div>
                 <div class="form-group"><label>税额标签</label><input v-model="data.labels.labelTax" /></div>
                 <div class="form-group"><label>总计标签</label><input v-model="data.labels.labelTotal" /></div>
              </div>
              <div class="grid-2">
                 <div class="form-group"><label>备注标题</label><input v-model="data.labels.headerNotes" /></div>
                 <div class="form-group"><label>条款标题</label><input v-model="data.labels.headerTerms" /></div>
              </div>
              <div class="grid-2">
                 <div class="form-group"><label>客户签字</label><input v-model="data.labels.signClient" /></div>
                 <div class="form-group"><label>授权盖章</label><input v-model="data.labels.signAuth" /></div>
              </div>
            </div>

          </div>
        </div>

        <div class="accordion">
          <div class="accordion-header" @click="openSections.company = !openSections.company">
            <span><Building :size="16"/> 我方信息 (DIY Logo)</span>
            <ChevronDown :size="16" :class="{rotate: openSections.company}" />
          </div>
          <div v-if="openSections.company" class="accordion-body">
            <div class="form-group">
                <label>公司名称 (Logo文字)</label>
                <input v-model="data.content.companyName" placeholder="请输入公司名称" />
            </div>

            <div class="form-group style-controls-container">
              <label>Logo 样式设计</label>
              <div class="style-controls">
                <div class="control-item">
                  <span>字号: {{ data.content.logoFontSize }}px</span>
                  <input type="range" v-model.number="data.content.logoFontSize" min="20" max="72" step="1" class="range-input">
                </div>
                
                <div class="control-item">
                  <span class="label-with-icon"><Palette :size="12" /> 颜色</span>
                  <div class="color-picker-group">
                    <input type="color" v-model="data.content.logoColor" class="color-input">
                    <span class="color-hex">{{ data.content.logoColor }}</span>
                  </div>
                </div>

                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="data.content.logoIsBold"> 加粗
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="data.content.logoIsItalic"> 倾斜
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group"><label>地址</label><input v-model="data.content.companyAddress" /></div>
            <div class="grid-2">
              <div class="form-group"><label>电话</label><input v-model="data.content.companyPhone" /></div>
              <div class="form-group"><label>邮箱</label><input v-model="data.content.companyEmail" /></div>
            </div>
          </div>
        </div>

        <div class="accordion">
          <div class="accordion-header" @click="openSections.customer = !openSections.customer">
            <span><User :size="16"/> 客户信息</span>
            <ChevronDown :size="16" :class="{rotate: openSections.customer}" />
          </div>
          <div v-if="openSections.customer" class="accordion-body">
            <div class="form-group"><label>客户单位名称</label><input v-model="data.content.customerName" /></div>
            <div class="form-group"><label>联系人</label><input v-model="data.content.customerContact" /></div>
            <div class="form-group"><label>联系电话</label><input v-model="data.content.customerPhone" /></div>
            <div class="form-group"><label>地址</label><input v-model="data.content.customerAddress" /></div>
          </div>
        </div>

        <div class="accordion">
          <div class="accordion-header" @click="openSections.setting = !openSections.setting">
            <span><Settings :size="16"/> 报价单设置</span>
            <ChevronDown :size="16" :class="{rotate: openSections.setting}" />
          </div>
          <div v-if="openSections.setting" class="accordion-body">
            <div class="form-group"><label>报价单号</label><input v-model="data.content.quoteNumber" /></div>
            <div class="form-group"><label>报价日期</label><input type="date" v-model="data.content.date" /></div>
            
            <div class="grid-2">
              <div class="form-group"><label>货币</label><input v-model="data.content.currencySymbol" /></div>
              <div class="form-group"><label>税率 (%)</label><input type="number" v-model.number="data.content.taxRate" /></div>
            </div>
          </div>
        </div>

        <div class="accordion">
          <div class="accordion-header" @click="openSections.items = !openSections.items">
            <span><Calculator :size="16"/> 报价明细</span>
            <ChevronDown :size="16" :class="{rotate: openSections.items}" />
          </div>
          <div v-if="openSections.items" class="accordion-body">
            <div v-for="item in data.content.items" :key="item.id" class="item-card">
              <button class="delete-btn" @click="removeItem(item.id)"><Trash2 :size="14"/></button>
              <input v-model="item.name" placeholder="产品名称" class="full-input item-name-input" />
              <input v-model="item.description" placeholder="规格描述" class="full-input item-desc-input" />
              <div class="grid-3">
                <div class="form-group"><label>数量</label><input v-model.number="item.quantity" type="number" /></div>
                <div class="form-group"><label>单位</label><input v-model="item.unit" /></div>
                <div class="form-group"><label>单价</label><input v-model.number="item.price" type="number" /></div>
              </div>
            </div>
            <button class="add-btn" @click="addItem"><Plus :size="14" /> 添加项目</button>
          </div>
        </div>

        <div class="accordion">
            <div class="accordion-header" @click="openSections.terms = !openSections.terms">
            <span><FileText :size="16"/> 销售与条款</span>
            <ChevronDown :size="16" :class="{rotate: openSections.terms}" />
          </div>
          <div v-if="openSections.terms" class="accordion-body">
            <div class="form-group"><label>销售负责人</label><input v-model="data.content.salesName" /></div>
            
            <!-- 新增：销售联系方式 -->
            <div class="grid-2">
               <div class="form-group"><label>销售电话</label><input v-model="data.content.salesPhone" placeholder="138xxxx..." /></div>
               <div class="form-group"><label>销售邮箱</label><input v-model="data.content.salesEmail" placeholder="email@..." /></div>
            </div>

            <div class="form-group"><label>备注说明</label><textarea v-model="data.content.notes" rows="3"></textarea></div>
            <div class="form-group"><label>付款条件</label><textarea v-model="data.content.terms" rows="2"></textarea></div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="save-status">
          <CheckCircle2 :size="14" /> 本地已自动保存
        </div>
        <div class="action-buttons">
          <button class="action-btn share-btn" @click="handleShare" :class="{ 'copied': shareStatus.copied }">
            <component :is="shareStatus.copied ? Copy : Share2" :size="16" /> 
            {{ shareStatus.text }}
          </button>
          <button class="action-btn print-btn" @click="handlePrint">
            <Printer :size="16" /> 打印 / PDF
          </button>
        </div>
        <div v-if="shareStatus.copied" class="share-tip">链接已复制，可直接粘贴给他人</div>
      </div>
    </aside>

    <main class="preview-area" :class="{ 'preview-readonly': isReadOnly }">
      
      <div v-if="isReadOnly" class="readonly-toolbar no-print">
         <div class="toolbar-content">
            <div class="toolbar-header">
               <span class="toolbar-icon-bg"><Share2 :size="20" /></span>
               <span class="toolbar-title">只读预览模式</span>
            </div>
            <p class="toolbar-desc">您正在查看他人分享的报价单</p>
            
            <div class="toolbar-actions">
               <button class="tool-btn secondary" @click="forkQuote">
                 <PenSquare :size="16" /> 复制并编辑
               </button>
               <button class="tool-btn primary" @click="handlePrint">
                 <Printer :size="16" /> 打印 / 下载
               </button>
            </div>
         </div>
      </div>

      <div class="a4-page">
        <header class="page-header">
          <div class="brand">
            <h1 
              class="diy-logo"
              :style="{
                fontSize: data.content.logoFontSize + 'px',
                fontWeight: data.content.logoIsBold ? 'bold' : 'normal',
                fontStyle: data.content.logoIsItalic ? 'italic' : 'normal',
                color: data.content.logoColor 
              }"
            >
              {{ data.content.companyName }}
            </h1>
            <div class="brand-contact">
                <p class="sub-info">{{ data.content.companyAddress }}</p>
                <p class="sub-info">
                {{ data.labels.prefixPhone }}: {{ data.content.companyPhone }} | 
                {{ data.labels.prefixEmail }}: {{ data.content.companyEmail }}
                </p>
            </div>
          </div>
          <div class="quote-meta">
            <h2 class="title-bg">{{ data.labels.titleSub }}</h2>
            <div class="meta-content">
              <h2 class="title-main">{{ data.labels.titleMain }}</h2>
              <div class="meta-details">
                <p><strong>{{ data.labels.prefixQuoteNo }}:</strong> {{ data.content.quoteNumber }}</p>
                <p><strong>{{ data.labels.prefixDate }}:</strong> {{ data.content.date }}</p>
              </div>
            </div>
          </div>
        </header>

        <section class="info-grid">
          <div class="bill-to">
            <h3 class="section-label">{{ data.labels.headerBillTo }}</h3>
            <p class="name">{{ data.content.customerName }}</p>
            <p class="sub-text">{{ data.content.customerContact }}</p>
            <p class="sub-text">{{ data.content.customerPhone }}</p>
            <p class="sub-text">{{ data.content.customerAddress }}</p>
          </div>
          <div class="sales-rep">
            <h3 class="section-label">{{ data.labels.headerSales }}</h3>
            <p class="name">{{ data.content.salesName }}</p>
            <p class="sub-text">{{ data.content.salesPhone }}</p>
            <p class="sub-text">{{ data.content.salesEmail }}</p>
          </div>
        </section>

        <table class="quote-table">
          <thead>
            <tr>
              <th width="50">{{ data.labels.colIndex }}</th>
              <th>{{ data.labels.colItem }}</th>
              <th class="text-right">{{ data.labels.colPrice }}</th>
              <th class="text-center">{{ data.labels.colQty }}</th>
              <th class="text-right">{{ data.labels.colTotal }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data.content.items" :key="item.id">
              <td class="text-muted text-center">{{ index + 1 }}</td>
              <td>
                <div class="item-name">{{ item.name }}</div>
                <div class="item-desc">{{ item.description }}</div>
              </td>
              <td class="text-right">{{ data.content.currencySymbol }}{{ formatMoney(item.price) }}</td>
              <td class="text-center">{{ item.quantity }} {{ item.unit }}</td>
              <td class="text-right bold">{{ data.content.currencySymbol }}{{ formatMoney(item.price * item.quantity) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row">
            <span>{{ data.labels.labelSubtotal }}:</span> 
            <span>{{ data.content.currencySymbol }}{{ formatMoney(subtotal) }}</span>
          </div>
          <div class="total-row">
            <span>{{ data.labels.labelTax }} ({{ data.content.taxRate }}%):</span> 
            <span>{{ data.content.currencySymbol }}{{ formatMoney(taxAmount) }}</span>
          </div>
          <div class="total-row grand-total">
            <span>{{ data.labels.labelTotal }}:</span> 
            <span>{{ data.content.currencySymbol }}{{ formatMoney(total) }}</span>
          </div>
        </div>

        <footer class="page-footer">
          <div class="footer-grid">
            <div>
              <h4 class="section-label">{{ data.labels.headerNotes }}</h4>
              <p class="footer-text">{{ data.content.notes }}</p>
            </div>
            <div>
              <h4 class="section-label">{{ data.labels.headerTerms }}</h4>
              <p class="footer-text">{{ data.content.terms }}</p>
            </div>
          </div>
          <div class="sign-area">
            <div class="sign-box">{{ data.labels.signClient }}</div>
            <div class="sign-box">{{ data.labels.signAuth }}</div>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* --- 布局容器 --- */
.app-container { display: flex; height: 100vh; background: #e2e8f0; font-family: -apple-system, sans-serif; overflow: hidden; }

/* --- 侧边栏 --- */
.sidebar { 
  width: 380px; 
  background: white; 
  border-right: 1px solid #cbd5e1; 
  display: flex; 
  flex-direction: column; 
  height: 100%;
}
.sidebar-header { flex-shrink: 0; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.sidebar-header .title { font-weight: 800; font-size: 16px; color: #1e293b; display: flex; align-items: center; gap: 8px; }
.sidebar-content { flex: 1; padding: 16px; overflow-y: auto; min-height: 0; }
.sidebar-footer { flex-shrink: 0; padding: 16px 20px 41px 20px; background: #fff; border-top: 1px solid #e2e8f0; }

.reset-btn { color: #ef4444; border: none; background: #fee2e2; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.save-status { font-size: 12px; color: #10b981; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.share-tip { font-size: 11px; color: #10b981; text-align: center; margin-top: 6px; }

.action-buttons { display: flex; gap: 10px; }
.action-btn { flex: 1; padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; font-size: 13px; }
.print-btn { background: #334155; color: white; }
.print-btn:hover { background: #1e293b; }
.share-btn { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
.share-btn:hover { background: #c7d2fe; }
.share-btn.copied { background: #dcfce7; color: #15803d; border-color: #86efac; }

/* --- 侧边栏样式控件 --- */
.style-controls-container { background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
.style-controls { display: flex; flex-direction: column; gap: 12px; }
.control-item { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #64748b; }
.range-input { flex: 1; margin-left: 10px; accent-color: #334155; }
.checkbox-group { display: flex; gap: 15px; margin-top: 5px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #334155; cursor: pointer; }
.checkbox-label input { margin: 0; }
.label-with-icon { display: flex; align-items: center; gap: 6px; }

/* 颜色选择器样式 */
.color-picker-group { display: flex; align-items: center; gap: 8px; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; }
.color-input { 
  -webkit-appearance: none; border: none; width: 20px; height: 20px; padding: 0; background: none; cursor: pointer; 
}
.color-input::-webkit-color-swatch-wrapper { padding: 0; }
.color-input::-webkit-color-swatch { border: none; border-radius: 4px; border: 1px solid #e2e8f0; }
.color-hex { font-family: monospace; font-size: 12px; color: #334155; }


/* --- 预览区 (右侧) --- */
.preview-area { 
  flex: 1; 
  padding: 40px 40px 140px 40px; 
  overflow-y: auto; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  position: relative;
}

/* 只读模式下的特殊样式 */
.preview-area.preview-readonly {
  padding: 40px 40px 140px 40px; /* 恢复正常 Padding */
  background: #f1f5f9;
}

/* --- 只读工具栏 --- */
.readonly-toolbar {
  position: fixed;
  top: 50%;
  right: 30px; 
  transform: translateY(-50%); 
  width: 200px; 
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  z-index: 100;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.toolbar-content { display: flex; flex-direction: column; gap: 12px; }
.toolbar-header { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 4px; }
.toolbar-icon-bg { width: 40px; height: 40px; background: #e0e7ff; color: #4338ca; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.toolbar-title { font-size: 15px; font-weight: 700; color: #1e293b; }
.toolbar-desc { font-size: 12px; color: #64748b; text-align: center; margin: 0 0 10px 0; line-height: 1.4; }
.toolbar-actions { display: flex; flex-direction: column; gap: 10px; }
.tool-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; width: 100%; }
.tool-btn.primary { background: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
.tool-btn.primary:hover { background: #1d4ed8; transform: translateY(-1px); }
.tool-btn.secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
.tool-btn.secondary:hover { background: #e2e8f0; color: #0f172a; }

/* --- 通用样式 --- */
.accordion { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; background: white; }
.accordion-header { padding: 12px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 8px; }
.accordion-body { padding: 16px; border-top: 1px solid #e2e8f0; }
.rotate { transform: rotate(180deg); transition: 0.3s; }
.form-group { margin-bottom: 10px; }
.form-group label { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; box-sizing: border-box; outline: none; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.item-card { background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 10px; position: relative; border: 1px solid #e2e8f0; }
.item-name-input { font-weight: bold; margin-bottom: 4px; }
.delete-btn { position: absolute; right: 8px; top: 8px; color: #94a3b8; border: none; background: none; cursor: pointer; }
.add-btn { width: 100%; padding: 10px; border: 2px dashed #cbd5e1; background: white; border-radius: 6px; cursor: pointer; color: #64748b; font-size: 12px; font-weight: 500; }

/* Label Groups (New) */
.label-group-header { padding: 8px 10px; background: #f1f5f9; border-radius: 6px; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.label-group-body { padding: 4px 8px 12px 8px; }

/* A4 Page */
.a4-page { width: 210mm; min-height: 297mm; height: auto; flex-shrink: 0; background: white; padding: 15mm; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; flex-direction: column; box-sizing: border-box; overflow-wrap: break-word; word-break: break-word; }
.page-header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px; align-items: flex-start; }

/* Logo & Brand */
.brand { flex-shrink: 0; margin-right: 20px; flex: 1; }
/* DIY Logo 样式 */
.diy-logo { 
  margin: 0 0 10px 0; 
  line-height: 1.2; 
  transition: all 0.2s ease; 
}
.brand-contact { margin-top: 4px; }
.sub-info { font-size: 11px; color: #64748b; margin: 2px 0; }

/* Header Meta */
.quote-meta { text-align: right; position: relative; width: 250px; flex-shrink: 0; }
.title-bg { font-size: 40px; color: #000; opacity: 0.05; position: absolute; top: -10px; right: 0; margin: 0; font-weight: 900; z-index: 0; pointer-events: none; white-space: nowrap; }
.meta-content { position: relative; z-index: 10; }
.title-main { font-size: 24px; color: #0f172a; margin: 0 0 10px 0; font-weight: bold; }
.meta-details p { margin: 4px 0; font-size: 12px; color: #334155; line-height: 1.4; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
.section-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; font-weight: 700; }
.name { font-size: 15px; font-weight: bold; margin: 0 0 4px 0; color: #0f172a; }
.sub-text { font-size: 11px; color: #475569; margin: 2px 0; }

/* Table */
.quote-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
.quote-table th { background: #1e293b; color: white; padding: 10px; text-align: left; font-size: 11px; }
.quote-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.bold { font-weight: bold; }

/* Totals */
.totals-section { 
  align-self: flex-end; 
  margin-left: auto;     
  width: 240px; 
  margin-top: auto;
  page-break-inside: avoid;
}
.total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
.grand-total { border-top: 2px solid #1e293b; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: bold; }

/* Footer */
.page-footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
.footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.footer-text { font-size: 11px; color: #475569; white-space: pre-wrap; line-height: 1.5; word-wrap: break-word; }
.sign-area { display: flex; justify-content: space-between; margin-top: 50px; }
.sign-box { width: 160px; border-top: 1px solid #cbd5e1; text-align: center; padding-top: 8px; font-size: 11px; color: #94a3b8; }

@media print {
  .no-print { display: none !important; }
  
  .app-container,
  .preview-area,
  .a4-page { 
    display: block !important; 
    height: auto !important; 
    overflow: visible !important;
    position: static !important;
  }
  
  .preview-area { padding: 0 !important; background: white !important; }
  .a4-page { margin: 0 !important; box-shadow: none !important; width: 100% !important; }
  /* 打印时移除过渡效果 */
  .diy-logo { transition: none !important; }
}
</style>