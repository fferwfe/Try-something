人生履歷｜完整可部署包（含 UI 設定台）
================================================

你要的「全部檔案 + 背景/音效預設已填好 + 一個網頁統一改」已整合完成。

✅ 包含頁面
- admin.html
- player.html
- shop.html
- display.html
- display_purchases.html
- super1.html
- ui_config.html  ← 統一設定背景/音效（寫入 Firebase /system/uiConfig）

✅ 包含共用/原本 JS（你上傳的）
- js/common.js
- js/firebase-init.js
- js/firebase.js
- js/main.js
- js/shop.js

✅ 新增（背景/音效系統）
- js/site-ui-db.js   ← 每頁已自動加入引用（不破壞你原本功能）
- js/ui-config.js     ← ui_config.html 使用（含「第一次自動初始化預設」）

✅ 背景/音效檔案（已建好檔名，直接替換即可）
- images/bg-admin.jpg
- images/bg-player.jpg
- images/bg-shop.jpg
- images/bg-display.jpg
- images/bg-super.jpg
- sfx/click.mp3, ok.mp3, alert.mp3, danmaku.mp3, error.mp3

重要：images/ 與 sfx/ 目前是「佔位空檔」，你要換成真的圖片/JPG與MP3，檔名維持不變最省事。

使用方式
1) 解壓縮後整包放到 GitHub Pages 專案根目錄
2) 先打開 ui_config.html：它會在 /system/uiConfig 尚不存在時自動建立預設值
3) 在 ui_config.html 裡改背景檔名、透明度、音效開關、音量、檔名
4) 重新整理其他頁面（或等 on('value') 即時更新）即可套用

