# PV9911 Astro 專案

## 專案結構

```
pv991-astro/
├── public/
│   └── images/
│       ├── logo.png (選用)
│       ├── banner-1.jpg (必要)
│       ├── games/
│       │   ├── rich-mahjong.jpg
│       │   ├── super-ace.jpg
│       │   ├── fortune-gems.jpg
│       │   └── ... (共12張)
│       └── payments/
│           ├── visa.png
│           └── ... (選用)
├── src/
│   └── pages/
│       └── index.astro
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

## 安裝與運行

### 1. 安裝依賴
```bash
npm install
```

### 2. 開發模式
```bash
npm run dev
```
網站將在 http://localhost:4321 運行

### 3. 建置生產版本
```bash
npm run build
```

### 4. 預覽生產版本
```bash
npm run preview
```

## 圖片設置

### 放置圖片的位置
所有圖片都放在 `public/images/` 資料夾中。

### 需要的圖片清單

#### 1. 橫幅圖片 (必要)
- 位置: `public/images/banner-1.jpg`
- 尺寸: 1400x420px
- 在 `index.astro` 第 137 行取消註解

#### 2. 遊戲圖片 (12張，必要)
放在 `public/images/games/` 資料夾:

| 檔案名 | 遊戲名稱 |
|-------|---------|
| rich-mahjong.jpg | Rich Mahjong |
| super-ace.jpg | Super Ace |
| fortune-gems.jpg | Fortune Gems |
| money-coming.jpg | Money Coming |
| fortune-gems-2.jpg | Fortune Gems 2 |
| mahjong-ways-2.jpg | Mahjong Ways 2 |
| buffalo-king.jpg | Buffalo King |
| golden-empire.jpg | Golden Empire |
| prosperity-lion.jpg | Prosperity Lion |
| sweet-bonanza.jpg | Sweet Bonanza |
| lucky-piggy.jpg | Lucky Piggy |
| wild-shark.jpg | Wild Shark |

在 `index.astro` 第 164 行取消註解

#### 3. Logo 圖片 (選用)
- 位置: `public/images/logo.png`
- 尺寸: 高度 50px
- 在 `index.astro` 第 118 行取消註解

#### 4. 支付圖標 (選用)
- 位置: `public/images/payments/`
- 在 `index.astro` 第 218 行取消註解

## 如何添加圖片

### 步驟 1: 準備圖片
將圖片放入 `public/images/` 對應的資料夾

### 步驟 2: 取消註解
在 `src/pages/index.astro` 中找到對應的註解行並取消：

**橫幅圖片:**
```astro
<!-- 原本: -->
<!-- <img src="/images/banner-1.jpg" alt="Member Day 15"> -->

<!-- 取消註解後: -->
<img src="/images/banner-1.jpg" alt="Member Day 15">
```

**遊戲圖片:**
```astro
<!-- 原本: -->
<!-- <img src={`/images/games/${game.img}`} alt={game.name}> -->

<!-- 取消註解後: -->
<img src={`/images/games/${game.img}`} alt={game.name}>
```

### 步驟 3: 刪除佔位符
取消註解後，刪除對應的佔位符 div：
```astro
<!-- 刪除這個: -->
<div class="game-placeholder">{game.name}<br>圖片位置</div>
```

## Astro 特色

### 資料管理
所有平台和遊戲資料都在頁面頂部的 frontmatter 中：

```astro
---
const platforms = [
  { name: "Yes8", code: "M18-Yes8", ... },
  // ... 更多平台
];

const games = [
  { name: "Rich Mahjong", badge: "16000x", ... },
  // ... 更多遊戲
];
---
```

### 新增平台
在 `platforms` 陣列中新增:
```javascript
{
  name: "NewPlatform",
  code: "M25-NewPlatform",
  affiliate: "seom2501",
  url: "https://www.newplatform.com/m/home?affiliateCode=seom2501"
}
```

### 新增遊戲
在 `games` 陣列中新增:
```javascript
{
  name: "New Game",
  badge: "5000x",
  provider: "Provider Name",
  img: "new-game.jpg"
}
```

## SEO 優化

網站已包含:
- Meta 標題和描述（緬甸語）
- 響應式設計
- 語義化 HTML
- 優化的圖片載入

## 部署

### Netlify
```bash
npm run build
# 上傳 dist/ 資料夾
```

### Vercel
```bash
vercel
```

### GitHub Pages
```bash
npm run build
# 部署 dist/ 資料夾到 gh-pages 分支
```

## 自訂修改

### 修改顏色
在 `<style>` 區塊中修改:
```css
.logo span { color: #ff3b5c; }  /* Logo 顏色 */
.btn-primary { background: #ff3b5c; }  /* 按鈕顏色 */
```

### 修改平台顏色
在 CSS 底部:
```css
.platform-btn:nth-child(1) { background: linear-gradient(135deg, #ff6b00, #ff8c42); }
/* 修改漸變顏色 */
```

### 修改側邊欄項目
在 `sidebarItems` 陣列中修改:
```javascript
{ icon: "🏠", text: "新選項", href: "#new", active: false }
```

## 技術細節

- **框架**: Astro 4.0
- **語言**: TypeScript
- **樣式**: 內嵌 CSS（單頁面優化）
- **字體**: Noto Sans Myanmar + Roboto
- **圖片**: 靜態資源在 public/ 資料夾

## 效能優化

- ✅ 零 JavaScript runtime（靜態生成）
- ✅ CSS 內嵌減少請求
- ✅ 圖片延遲載入
- ✅ 最小化 HTML/CSS

## 瀏覽器支援

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- Mobile browsers

## 疑難排解

### 圖片無法顯示
1. 確認圖片在 `public/images/` 資料夾
2. 檢查檔案名稱大小寫
3. 確認已取消註解 `<img>` 標籤

### 開發伺服器無法啟動
```bash
rm -rf node_modules
npm install
npm run dev
```

### 建置失敗
確認 TypeScript 配置正確:
```bash
npm run build -- --verbose
```

## 需要協助？

查看 Astro 文件: https://docs.astro.build
