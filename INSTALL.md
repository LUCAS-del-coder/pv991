# PV9911 完整專案 - 安裝指南

## 📦 專案內容

此壓縮檔包含完整的 PV9911 Astro 專案，已針對 SEO 完全優化。

### 包含文件：
```
pv991-complete-project/
├── src/
│   └── pages/
│       └── index.astro          # SEO 優化的主頁
├── public/
│   ├── robots.txt               # 搜尋引擎爬蟲指引
│   └── images/                  # 圖片資料夾（需要添加圖片）
├── package.json                 # 專案依賴
├── astro.config.mjs            # Astro 配置
├── tsconfig.json               # TypeScript 配置
├── README-ASTRO.md             # Astro 使用說明
├── SEO-GUIDE.md                # SEO 完整指南
└── IMAGE-GUIDE.md              # 圖片放置指南
```

## 🚀 快速開始

### 1. 解壓縮文件
```bash
tar -xzf pv991-complete-project.tar.gz
cd pv991-complete-project
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 開發模式運行
```bash
npm run dev
```
網站將在 http://localhost:4321 運行

### 4. 建置生產版本
```bash
npm run build
```
生成的靜態文件在 `dist/` 資料夾

### 5. 預覽生產版本
```bash
npm run preview
```

## 📸 添加圖片

### 必要圖片：

1. **橫幅圖片**
   - 位置: `public/images/banner-1.jpg`
   - 尺寸: 1400x420px
   - 在 `src/pages/index.astro` 第 137 行取消註解

2. **遊戲圖片** (12張)
   - 位置: `public/images/games/`
   - 檔案名: 
     - rich-mahjong.jpg
     - super-ace.jpg
     - fortune-gems.jpg
     - money-coming.jpg
     - fortune-gems-2.jpg
     - mahjong-ways-2.jpg
     - buffalo-king.jpg
     - golden-empire.jpg
     - prosperity-lion.jpg
     - sweet-bonanza.jpg
     - lucky-piggy.jpg
     - wild-shark.jpg
   - 尺寸: 300x300px
   - 在 `src/pages/index.astro` 第 164 行取消註解

3. **OG Image（社交分享圖）**
   - 位置: `public/images/og-image.jpg`
   - 尺寸: 1200x630px
   - 包含: PV9911 Logo + 主要賣點

4. **Logo（選用）**
   - 位置: `public/images/logo.png`
   - 尺寸: 高度 50px

5. **支付圖標（選用）**
   - 位置: `public/images/payments/`
   - 檔案: visa.png, mastercard.png 等

詳細說明請參考 `IMAGE-GUIDE.md`

## ⚙️ 修改配置

### 修改網站域名
在 `src/pages/index.astro` 第 7 行：
```javascript
const siteUrl = "https://你的域名.com"; // 修改這裡
```

### 修改平台資料
在 `src/pages/index.astro` 第 10-57 行，修改 `platforms` 陣列

### 修改遊戲資料
在 `src/pages/index.astro` 第 59-72 行，修改 `games` 陣列

## 🌐 部署

### Netlify
1. 連接 Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. 自動部署完成！

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
```bash
npm run build
# 將 dist/ 資料夾部署到 gh-pages 分支
```

### 傳統主機
1. 運行 `npm run build`
2. 上傳 `dist/` 資料夾內容到伺服器
3. 確保伺服器支援靜態文件

## 🔍 SEO 設置

### 部署後必須做的：

1. **Google Search Console**
   - 前往: https://search.google.com/search-console
   - 添加網站
   - 驗證所有權
   - 提交 sitemap: `https://你的域名.com/sitemap.xml`

2. **建立 Sitemap**
   在 `public/` 資料夾創建 `sitemap.xml`：
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://你的域名.com/</loc>
       <lastmod>2025-01-02</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
   </urlset>
   ```

3. **Google Analytics（選用）**
   在 `src/pages/index.astro` 的 `<head>` 中添加 GA 代碼

詳細 SEO 指南請參考 `SEO-GUIDE.md`

## 📝 自訂修改

### 修改顏色
在 `index.astro` 的 `<style>` 區塊中：
```css
.logo span { color: #ff3b5c; }  /* Logo 顏色 */
.btn-primary { background: #ff3b5c; }  /* 按鈕顏色 */
```

### 添加新平台
在 `platforms` 陣列中添加：
```javascript
{
  name: "NewPlatform",
  code: "M25-NewPlatform",
  affiliate: "seom2501",
  url: "https://www.newplatform.com/m/home?affiliateCode=seom2501",
  description: "平台描述"
}
```

### 添加新遊戲
在 `games` 陣列中添加：
```javascript
{
  name: "New Game",
  badge: "5000x",
  provider: "Provider Name",
  img: "new-game.jpg"
}
```

## 🛠️ 可用指令

```bash
npm run dev       # 開發模式
npm run build     # 建置生產版本
npm run preview   # 預覽生產版本
```

## 📱 特色功能

✅ **SEO 完全優化**
- Meta tags
- Open Graph
- Schema.org
- 語義化 HTML

✅ **響應式設計**
- 桌面版
- 平板版
- 手機版

✅ **效能優化**
- 靜態生成
- 快速載入
- 圖片 lazy loading

✅ **7個平台連結**
- Yes8, Ygn9, Pya777, Mmk99, Kbz999, Mmk123, Mmk8
- 每個都有獨特的顏色和連結

✅ **12個遊戲展示**
- 圖片佔位符已留空
- 完整的遊戲資訊

## ❓ 常見問題

### Q: 如何修改網站內容？
A: 編輯 `src/pages/index.astro` 文件

### Q: 圖片放在哪裡？
A: 所有圖片放在 `public/images/` 資料夾

### Q: 如何添加新頁面？
A: 在 `src/pages/` 資料夾創建新的 `.astro` 文件

### Q: 建置後的文件在哪？
A: 在 `dist/` 資料夾

### Q: 如何更新依賴？
A: 運行 `npm update`

## 📞 技術支援

### 相關文件：
- [Astro 官方文件](https://docs.astro.build)
- README-ASTRO.md - Astro 詳細說明
- SEO-GUIDE.md - SEO 完整指南
- IMAGE-GUIDE.md - 圖片設置指南

### 檢查工具：
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Validator](https://validator.schema.org/)

## ⚠️ 重要提醒

1. ✅ 記得修改 `siteUrl` 為你的實際域名
2. ✅ 添加所有必要的圖片
3. ✅ 建立 sitemap.xml
4. ✅ 部署後提交到 Google Search Console
5. ✅ 確保使用 HTTPS

## 🎉 準備就緒！

你的 PV9911 網站已經完全優化並準備好部署了！

只需要：
1. 添加圖片
2. 修改域名
3. 建置並部署
4. 提交到搜尋引擎

祝你的網站 SEO 排名節節高升！
