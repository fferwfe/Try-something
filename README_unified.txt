# 人生履歷｜統一整包（unified_v1）

## 你要的核心規格
- SUPER（UID: AT3xEkjygoZEcCbrG8VdZVklEfj1）用 `device_control.html` 控制：
  - 看全部裝置（devicesSeen：含裝置名稱/最後上線/頁面）
  - 鎖/解鎖 admin / player
  - 核可/剔除 admin 裝置
  - 玩家鎖定時：產生 `playerAllowed` 快照，鎖定後只允許快照內裝置進 player.html

- ADMIN：必須 Firebase Auth 登入 + 裝置在 adminDevices 且未 revoked，才能進 `admin.html` / `shop.html`
- PLAYER：平常不限制；`playerLocked=true` 時才會限制（需在 playerAllowed）
- DISPLAY/BOARD/INDEX：不限制；但都會回報 devicesSeen

## 檔案
- index.html
- player.html
- admin.html
- shop.html
- display.html
- display_purchases.html
- board.html
- device_control.html
- realtime_database_rules.json（貼到 Firebase Realtime Database Rules）

## 上線前必做
1. 到 Firebase Console → Realtime Database → Rules，把 `realtime_database_rules.json` 的內容貼上
2. Firebase Authentication 啟用 Email/Password（SUPER 與管理員帳號）
3. 第一次每台裝置進入時會要求輸入「裝置名稱」（存在 localStorage）
