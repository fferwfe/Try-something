【統一版檔案包】（產生時間：2026-01-31 20:42:31)

✅ 你要的更新已包含：
1) shop 密碼門禁：345721
2) 裝置控制 device_control.html：新增「踢除玩家（移出允許名單）」與「移除 devicesSeen」

檔案清單（已統一命名在 ZIP 內）：
- index.html
- player.html
- admin.html            （取用 admin.html 原檔）
- admin_updated.html    （你另一版 admin）
- shop.html             （已套用密碼門禁 345721）
- board.html
- display.html
- display_purchases.html
- device_control.html   （SUPER 裝置控制中心）
- README.md
- realtime_database_rules_secure.json
- realtime_database_rules_open.json

Realtime Database Rules：
- secure：建議上線/半上線（devicesSeen 僅 SUPER 可讀；其餘遊戲節點目前仍開放讀寫，避免未登入頁面 permission_denied）
- open：除錯用（全開）

下一步如果你要「把 players/shop 等也收緊」：
→ 需要你啟用 Firebase Anonymous Auth，並讓所有頁面自動匿名登入，然後 rules 才能把 .write 改成 auth != null。
