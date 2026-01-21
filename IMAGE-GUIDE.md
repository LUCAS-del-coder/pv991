# PV9911 圖片放置指南

## 資料夾結構

請建立以下資料夾結構：

```
pv991-website/
├── pv991-with-placeholders.html
└── images/
    ├── logo.png (選用)
    ├── banner-1.jpg
    ├── banner-2.jpg (選用，可多個)
    ├── games/
    │   ├── rich-mahjong.jpg
    │   ├── super-ace.jpg
    │   ├── fortune-gems.jpg
    │   ├── money-coming.jpg
    │   ├── fortune-gems-2.jpg
    │   ├── mahjong-ways-2.jpg
    │   ├── buffalo-king.jpg
    │   ├── golden-empire.jpg
    │   ├── prosperity-lion.jpg
    │   ├── sweet-bonanza.jpg
    │   ├── lucky-piggy.jpg
    │   └── wild-shark.jpg
    └── payments/
        ├── visa.png (選用)
        ├── mastercard.png (選用)
        ├── neteller.png (選用)
        └── skrill.png (選用)
```

## 圖片需求清單

### 1. Logo (選用)
- **位置**: `images/logo.png`
- **建議尺寸**: 高度 50px，寬度自動
- **格式**: PNG (透明背景)
- **使用**: 如果你有 PV9911 logo 圖片，取消註解 HTML 中的 `<img src="images/logo.png">` 並刪除文字 logo

### 2. 橫幅圖片 (必要)
- **位置**: `images/banner-1.jpg`
- **建議尺寸**: 1400x420px
- **格式**: JPG 或 PNG
- **內容**: Member Day 15 活動橫幅（類似你範例中的紫色橫幅）
- **使用**: 在 HTML 第 386 行取消註解 `<img src="images/banner-1.jpg">`

### 3. 遊戲圖片 (12 張，必要)

每個遊戲需要一張圖片：

| 遊戲名稱 | 檔案名 | 建議尺寸 |
|---------|--------|---------|
| Rich Mahjong | `images/games/rich-mahjong.jpg` | 300x300px |
| Super Ace | `images/games/super-ace.jpg` | 300x300px |
| Fortune Gems | `images/games/fortune-gems.jpg` | 300x300px |
| Money Coming | `images/games/money-coming.jpg` | 300x300px |
| Fortune Gems 2 | `images/games/fortune-gems-2.jpg` | 300x300px |
| Mahjong Ways 2 | `images/games/mahjong-ways-2.jpg` | 300x300px |
| Buffalo King | `images/games/buffalo-king.jpg` | 300x300px |
| Golden Empire | `images/games/golden-empire.jpg` | 300x300px |
| Prosperity Lion | `images/games/prosperity-lion.jpg` | 300x300px |
| Sweet Bonanza | `images/games/sweet-bonanza.jpg` | 300x300px |
| Lucky Piggy | `images/games/lucky-piggy.jpg` | 300x300px |
| Wild Shark | `images/games/wild-shark.jpg` | 300x300px |

### 4. 支付方式圖標 (選用)
- **位置**: `images/payments/`
- **建議尺寸**: 高度 30px，寬度自動
- **格式**: PNG (透明背景)
- **檔案**:
  - `visa.png`
  - `mastercard.png`
  - `neteller.png`
  - `skrill.png`

## 如何添加圖片

### 步驟 1: 準備圖片
從 PV9911 網站或遊戲供應商網站下載遊戲圖片

### 步驟 2: 放置圖片
將圖片放入對應的資料夾

### 步驟 3: 取消註解
在 HTML 文件中找到對應的註解並取消：

**範例 - Logo:**
```html
<!-- 原本 (註解狀態) -->
<!-- <img src="images/logo.png" alt="PV9911" class="logo-img"> -->

<!-- 取消註解後 -->
<img src="images/logo.png" alt="PV9911" class="logo-img">
```

**範例 - 橫幅:**
```html
<!-- 原本 -->
<!-- <img src="images/banner-1.jpg" alt="Member Day 15"> -->

<!-- 取消註解後 -->
<img src="images/banner-1.jpg" alt="Member Day 15">
```

**範例 - 遊戲圖片:**
```html
<!-- 原本 -->
<!-- <img src="images/games/rich-mahjong.jpg" alt="Rich Mahjong"> -->

<!-- 取消註解後 -->
<img src="images/games/rich-mahjong.jpg" alt="Rich Mahjong">
```

### 步驟 4: 刪除佔位符
取消註解圖片後，刪除對應的佔位符 div：

```html
<!-- 刪除這個 -->
<div class="game-placeholder">Rich Mahjong<br>圖片位置</div>
```

## 快速搜尋替換

在文字編輯器中使用搜尋功能：

1. 搜尋 `<!-- <img src="images/` 找到所有被註解的圖片
2. 刪除 `<!--` 和 `-->` 來取消註解
3. 搜尋 `<div class="game-placeholder">` 並刪除整個 div

## 優化建議

### 圖片優化
- 使用 TinyPNG 或 ImageOptim 壓縮圖片
- 橫幅圖片建議 100-200KB
- 遊戲圖片建議 50-100KB
- 支付圖標建議 10-20KB

### 格式選擇
- Logo 和支付圖標：PNG (透明背景)
- 橫幅和遊戲圖片：JPG (較小檔案)
- 如需更好品質：WebP 格式

## 替代方案

如果暫時沒有圖片，可以：
1. 保留佔位符（目前狀態）
2. 使用免費圖片網站（不推薦用於商業用途）
3. 先使用純色背景測試版面

## 測試

添加圖片後：
1. 在瀏覽器中打開 HTML 文件
2. 檢查所有圖片是否正確顯示
3. 確認圖片尺寸和比例正確
4. 測試響應式設計（手機版）

## 注意事項

⚠️ **版權警告**
- 確保你有權使用這些圖片
- 遊戲圖片通常有版權保護
- 建議聯繫遊戲供應商獲取官方素材
- 支付圖標需從官方網站下載

## 需要協助？

如果遇到問題：
1. 檢查檔案路徑是否正確
2. 確認圖片格式是否支援
3. 使用瀏覽器開發者工具檢查錯誤
4. 確認圖片檔案大小寫與 HTML 中一致
