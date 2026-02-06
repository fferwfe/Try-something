# Life Resume (Cc-root) 修正版

## 你要放的結構
- 把整個 `Cc/` 資料夾放到 GitHub repo 根目錄
- repo 根目錄的 `index.html` 會自動跳轉到 `./Cc/index.html`

## 商品圖片
- 圖片放：`Cc/images/shop/002.jpg`（不要寫 Cc/ 在資料庫）
- images.json 放在：`Cc/images.json`，內容列出檔名：["001.jpg","002.jpg",...]

## 背景圖片
- 背景放：`Cc/images/backgrounds/bg-player.jpg` 等 5 張
  - bg-player.jpg / bg-admin.jpg / bg-shop.jpg / bg-display.jpg / bg-super.jpg

## 本次修正
- player.html：支援 item.image / item.imageUrl
- shop.js：上架同時寫入 imageUrl（相容舊資料）
