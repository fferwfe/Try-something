【事件音效更換指南】

本版本已加入 4 個事件音效觸發點 + 1 個送出完成音效：

1) 提示框彈出時（Event Modal 顯示）
   檔案：/57/assets/sfx/event_popup.wav

2) 玩家按「我完成了」送出完成申請時（finishRequest: pending）
   檔案：/57/assets/sfx/event_submit.wav

3) 被駁回時（finishRequest.status 變成 rejected）
   檔案：/57/music/da-nice-youtuber常用素材-無版權-國外流行梗篇.mp3
   ※如果你想換成別的音效：把這支 mp3 換成你的音效（檔名不變），或改 player5.html 的 SFX.reject 路徑。

4) 管理員確認完成時（activeEvent.status 變成 success）
   檔案：/57/music/da-nice-youtuber常用素材-無版權-國外流行梗篇.mp3
   ※此刻才會播放（不會在玩家送出申請時播放完成音效）

5) 剩下 1 分鐘時（倒數 <= 60 秒）
   檔案：/57/assets/sfx/event_1min.wav

【換音效最簡單方式】
- 直接用同檔名覆蓋對應檔案即可（不用改程式）。
- 若要用 mp3 取代 wav，也可以，但要同步把 player5.html 的 SFX 路徑改成 .mp3。

【測試】
- 必須用 http 開啟（例如 python -m http.server），避免 file:// 限制。
