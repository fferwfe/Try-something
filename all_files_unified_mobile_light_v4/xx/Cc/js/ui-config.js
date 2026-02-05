// /js/ui-config.js
(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyB0Gvpk5Y6ZermG67lFm-ecaXYGL5pl7mk",
    authDomain: "try-something-ddd1e.firebaseapp.com",
    databaseURL: "https://try-something-ddd1e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "try-something-ddd1e",
    storageBucket: "try-something-ddd1e.firebasestorage.app",
    messagingSenderId: "245905464126",
    appId: "1:245905464126:web:4aea37e1b2bb0bdd1a2a6f"
  };

  if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const ref = db.ref("system/uiConfig");

  const $ = (id) => document.getElementById(id);

  function nowText(ts){
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString();
  }
  function num(v, dflt){ v = Number(v); return Number.isFinite(v) ? v : dflt; }
  function clamp01(v){ return Math.max(0, Math.min(1, num(v, 0))); }

  function getDefaultsFromUI(){
    return {
      imagesDir: ($("imagesDir").value || "./images").trim() || "./images",
      sfxDir: ($("sfxDir").value || "./sfx").trim() || "./sfx",
      bgDefault: ($("bgDefault").value || "").trim(),
      bgOpacity: clamp01($("bgOpacity").value),
      bgBlurPx: Math.max(0, Math.min(40, num($("bgBlur").value, 0))),
      sfxEnabled: $("sfxEnabled").value === "true",
      sfxVolume: clamp01($("sfxVolume").value),
    };
  }
  function setDefaultsToUI(cfg){
    const d = (cfg.defaults || {});
    $("imagesDir").value = d.imagesDir || "./images";
    $("sfxDir").value = d.sfxDir || "./sfx";
    $("bgDefault").value = d.bgDefault || "";
    $("bgOpacity").value = clamp01(d.bgOpacity ?? 0.18);
    $("bgBlur").value = num(d.bgBlurPx ?? 0, 0);
    $("sfxEnabled").value = String((d.sfxEnabled ?? true) === true);
    $("sfxVolume").value = clamp01(d.sfxVolume ?? 0.35);
  }
  function getSfxFilesFromUI(){
    return {
      click: ($("sfx_click").value || "click.mp3").trim() || "click.mp3",
      ok: ($("sfx_ok").value || "ok.mp3").trim() || "ok.mp3",
      alert: ($("sfx_alert").value || "alert.mp3").trim() || "alert.mp3",
      danmaku: ($("sfx_danmaku").value || "danmaku.mp3").trim() || "danmaku.mp3",
      error: ($("sfx_error").value || "error.mp3").trim() || "error.mp3",
    };
  }
  function setSfxFilesToUI(cfg){
    const f = (cfg.sfxFiles || {});
    $("sfx_click").value = f.click || "click.mp3";
    $("sfx_ok").value = f.ok || "ok.mp3";
    $("sfx_alert").value = f.alert || "alert.mp3";
    $("sfx_danmaku").value = f.danmaku || "danmaku.mp3";
    $("sfx_error").value = f.error || "error.mp3";
  }
  function getPageKey(){ return $("pageKey").value; }

  async function loadAll(){
    $("statusMsg").textContent = "讀取中…";
    const snap = await ref.get();
    const cfg = snap.val() || {};
    $("lastUpdate").textContent = nowText(cfg.updatedAt || cfg.lastUpdate || 0);
    setDefaultsToUI(cfg);
    setSfxFilesToUI(cfg);

    const k = getPageKey();
    $("bgFile").value = ((cfg.backgrounds || {})[k] || "").trim();

    $("jsonBox").value = JSON.stringify(cfg, null, 2);
    $("statusMsg").textContent = "已連線。可修改後按儲存。";
    return cfg;
  }

  async function saveBgForPage(){
    const k = getPageKey();
    const bgFile = ($("bgFile").value || "").trim();
    await ref.child("backgrounds").child(k).set(bgFile);
    await ref.update({ updatedAt: Date.now() });
    await loadAll();
    alert(`已儲存 ${k} 背景`);
  }

  async function saveDefaults(){
    await ref.child("defaults").set(getDefaultsFromUI());
    await ref.update({ updatedAt: Date.now() });
    await loadAll();
    alert("已儲存全站預設");
  }

  async function saveSfxDefaults(){
    const d = getDefaultsFromUI();
    await ref.child("defaults").update({
      sfxEnabled: d.sfxEnabled,
      sfxVolume: d.sfxVolume,
      sfxDir: d.sfxDir
    });
    await ref.update({ updatedAt: Date.now() });
    await loadAll();
    alert("已儲存音效預設");
  }

  async function saveSfxFiles(){
    await ref.child("sfxFiles").set(getSfxFilesFromUI());
    await ref.update({ updatedAt: Date.now() });
    await loadAll();
    alert("已儲存音效檔名");
  }

  async function importJson(){
    let obj;
    try{ obj = JSON.parse($("jsonBox").value || "{}"); }
    catch{ alert("JSON 格式錯誤"); return; }
    obj.updatedAt = Date.now();
    await ref.set(obj);
    await loadAll();
    alert("已匯入並覆蓋 /system/uiConfig");
  }

  async function resetConfig(){
    if (!confirm("確定清空 /system/uiConfig？")) return;
    await ref.remove();
    await loadAll();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    try{ await loadAll(); }
    catch(e){
      console.error(e);
      $("statusMsg").textContent = "連線失敗：請確認 Firebase rules / 網路狀態。";
    }

    $("btnApplyBg").addEventListener("click", () => saveBgForPage().catch(e=>alert(e.message||"儲存失敗")));
    $("btnLoadBg").addEventListener("click", () => loadAll().catch(e=>alert(e.message||"讀取失敗")));
    $("btnSaveDefaults").addEventListener("click", () => saveDefaults().catch(e=>alert(e.message||"儲存失敗")));
    $("btnSaveSfx").addEventListener("click", () => saveSfxDefaults().catch(e=>alert(e.message||"儲存失敗")));
    $("btnSaveSfxFiles").addEventListener("click", () => saveSfxFiles().catch(e=>alert(e.message||"儲存失敗")));
    $("btnLoadSfxFiles").addEventListener("click", () => loadAll().catch(e=>alert(e.message||"讀取失敗")));
    $("btnExport").addEventListener("click", () => loadAll().catch(e=>alert(e.message||"匯出失敗")));
    $("btnImport").addEventListener("click", () => importJson().catch(e=>alert(e.message||"匯入失敗")));
    $("btnReset").addEventListener("click", () => resetConfig().catch(e=>alert(e.message||"清空失敗")));
  });
})();


// ---- Auto init defaults (only if /system/uiConfig does NOT exist) ----
(async function initUiConfigDefaultsOnce(){
  try {
    const r = firebase.database().ref("system/uiConfig");
    const snap = await r.get();
    if (!snap.exists()) {
      await r.set({"defaults": {"imagesDir": "./images", "sfxDir": "./sfx", "bgOpacity": 0.18, "bgBlurPx": 0, "bgDefault": "bg-player.jpg", "sfxEnabled": true, "sfxVolume": 0.35}, "backgrounds": {"admin": "bg-admin.jpg", "player": "bg-player.jpg", "shop": "bg-shop.jpg", "display": "bg-display.jpg", "super": "bg-super.jpg"}, "sfxFiles": {"click": "click.mp3", "ok": "ok.mp3", "alert": "alert.mp3", "danmaku": "danmaku.mp3", "error": "error.mp3"}, "updatedAt": 1770310615655});
      console.log("[ui_config] Initialized /system/uiConfig defaults");
    }
  } catch(e) {
    console.warn("[ui_config] init defaults failed", e);
  }
})();
