# 圖片放置指南

## 📁 資料夾結構

請將圖片放在以下對應的資料夾中：

```
public/images/
├── logo.png (選用 - Logo 圖片)
├── banner-1.jpg (必要 - 橫幅圖片)
├── og-image.jpg (選用 - Open Graph 圖片，用於社交媒體分享)
├── games/ (必要 - 遊戲圖片資料夾)
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
└── payments/ (選用 - 支付方式圖標)
    ├── visa.png
    ├── mastercard.png
    ├── neteller.png
    └── skrill.png
```

## 🖼️ 圖片需求清單

### 1. Logo 圖片 (選用)
- **位置**: `public/images/logo.png`
- **建議尺寸**: 高度 50px，寬度自動
- **格式**: PNG (透明背景)

### 2. 橫幅圖片 (必要)
- **位置**: `public/images/banner-1.jpg`
- **建議尺寸**: 1400x420px
- **格式**: JPG 或 PNG
- **內容**: Member Day 15 活動橫幅

### 3. Open Graph 圖片 (選用)
- **位置**: `public/images/og-image.jpg`
- **建議尺寸**: 1200x630px
- **格式**: JPG
- **用途**: 社交媒體分享時顯示的圖片

### 4. 遊戲圖片 (12 張，必要)

請將以下 12 張遊戲圖片放入 `public/images/games/` 資料夾：

| 遊戲名稱 | 檔案名 | 建議尺寸 |
|---------|--------|---------|
| Rich Mahjong | `rich-mahjong.jpg` | 300x300px |
| Super Ace | `super-ace.jpg` | 300x300px |
| Fortune Gems | `fortune-gems.jpg` | 300x300px |
| Money Coming | `money-coming.jpg` | 300x300px |
| Fortune Gems 2 | `fortune-gems-2.jpg` | 300x300px |
| Mahjong Ways 2 | `mahjong-ways-2.jpg` | 300x300px |
| Buffalo King | `buffalo-king.jpg` | 300x300px |
| Golden Empire | `golden-empire.jpg` | 300x300px |
| Prosperity Lion | `prosperity-lion.jpg` | 300x300px |
| Sweet Bonanza | `sweet-bonanza.jpg` | 300x300px |
| Lucky Piggy | `lucky-piggy.jpg` | 300x300px |
| Wild Shark | `wild-shark.jpg` | 300x300px |

### 5. 支付方式圖標 (選用)

請將支付圖標放入 `public/images/payments/` 資料夾：

- `visa.png` - VISA 圖標
- `mastercard.png` - Mastercard 圖標
- `neteller.png` - Neteller 圖標
- `skrill.png` - Skrill 圖標

**建議尺寸**: 高度 30px，寬度自動
**格式**: PNG (透明背景)

## 📝 放置圖片後的步驟

1. **放置圖片**: 將圖片放入對應的資料夾
2. **取消註解**: 在 `src/pages/index.astro` 中取消對應的圖片標籤註解
3. **刪除佔位符**: 刪除對應的佔位符 div

詳細說明請參考 `README-ASTRO.md` 文件。

## ⚠️ 注意事項

- 確保檔案名稱與代碼中的名稱完全一致（包括大小寫）
- 建議使用圖片壓縮工具優化檔案大小
- 確保你有權使用這些圖片（版權問題）


