// /js/site-ui-db.js
// =======================================================
// 全站 UI 套用器（背景 + 音效）
// ✅ 背景：固定資料夾 + 固定命名 + 可選覆蓋（override）
//    - 固定資料夾：./images/backgrounds
//    - 固定檔名：bg-{page}.jpg（player/admin/shop/display/super）
//    - 覆蓋檔名：/system/uiConfig/bgOverride/{pageKey} = "any-file.jpg"
//      - 若檔案存在 -> 用覆蓋
//      - 不存在 -> console.warn 並回退固定檔
// ✅ 音效：完全由 /system/uiConfig 控制（不注入任何每頁音效面板 UI）
//    - defaults: sfxEnabled / sfxVolume / sfxDir
//    - sfxFiles: 任意 key -> 檔名（支援你新增/刪除）
//    - 使用：SFX.play("buy") / SFX.play("win") ...
// =======================================================

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
  const uiRef = db.ref("system/uiConfig");

  const pageKey = (document.body?.dataset?.page || "").trim() || guessPageKey();
  injectBackgroundCSS();

  // ===== 固定背景規則 =====
  const FIXED_BG_DIR = "./images/backgrounds";
  const FIXED_BG_MAP = {
    player:  "bg-player.jpg",
    admin:   "bg-admin.jpg",
    shop:    "bg-shop.jpg",
    display: "bg-display.jpg",
    super:   "bg-super.jpg"
  };

  // runtime cache
  let runtime = null;

  uiRef.on("value", (snap) => {
    runtime = snap.val() || {};
    applyAll().catch(e => console.warn("[UI] applyAll failed", e));
  });

  async function applyAll(){
    const d = runtime.defaults || {};
    const overrideMap = runtime.bgOverride || {};

    // ---- Background style params (UI-controlled) ----
    const bgOpacity = clamp01(d.bgOpacity ?? 0.18);
    const bgBlurPx  = clampNum(d.bgBlurPx ?? 0, 0, 40);
    document.documentElement.style.setProperty("--bg-opacity", String(bgOpacity));
    document.documentElement.style.setProperty("--bg-blur", `${bgBlurPx}px`);

    // ---- Background fixed + override ----
    const fixedFile = FIXED_BG_MAP[pageKey] || FIXED_BG_MAP.player;
    const overrideFile = String(overrideMap[pageKey] || "").trim();
    await applyBackground(overrideFile, fixedFile);

    // ---- SFX (system-only) ----
    const enabled = (d.sfxEnabled ?? true) === true;
    const volume  = clamp01(d.sfxVolume ?? 0.35);
    const sfxDir  = String(d.sfxDir || "./sfx").replace(/\/+$/g, "") || "./sfx";

    // Build source map from sfxFiles (supports arbitrary keys)
    const srcMap = buildSfxSrcMap(sfxDir, runtime.sfxFiles || {});
    ensureSFX(srcMap, enabled, volume);
  }

  async function applyBackground(overrideFile, fixedFile){
    // ① override
    if (overrideFile){
      const u1 = `${FIXED_BG_DIR}/${overrideFile}`;
      if (await imgExists(u1)){
        setBg(u1, "override");
        return;
      }
      console.warn(`[UI] 覆蓋背景不存在：${u1}（page=${pageKey}），回退固定背景`);
    }

    // ② fixed
    const u2 = `${FIXED_BG_DIR}/${fixedFile}`;
    if (await imgExists(u2)){
      setBg(u2, "fixed");
      return;
    }

    // ③ none
    document.documentElement.style.setProperty("--bg-img", "none");
    console.error(`[UI] ❌ 找不到固定背景：${u2}（page=${pageKey}）。請放到 /images/backgrounds/ 並命名正確。`);
  }

  function setBg(url, mode){
    document.documentElement.style.setProperty("--bg-img", `url('${url}')`);
    console.log(`[UI] 使用 ${mode} 背景：${url}（page=${pageKey}）`);
  }

  function imgExists(url){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url + (url.includes("?") ? "&" : "?") + "v=" + Date.now(); // avoid cache misread
    });
  }

  // ===== SFX core =====
  let sfx = null;

  function ensureSFX(srcMap, enabled, volume){
    if (!sfx){
      sfx = createSFX();
      window.SFX = sfx.api; // SFX.play("buy")
    }
    sfx.setSources(srcMap);
    sfx.setEnabled(enabled);
    sfx.setVolume(volume);
  }

  function buildSfxSrcMap(sfxDir, sfxFilesObj){
    const out = {};

    // Optional fallbacks (so base events work even if you didn't add them to sfxFiles)
    const fallbacks = {
      click: "click.mp3",
      ok: "ok.mp3",
      alert: "alert.mp3",
      danmaku: "danmaku.mp3",
      error: "error.mp3"
    };
    Object.keys(fallbacks).forEach(k => out[k] = `${sfxDir}/${fallbacks[k]}`);

    // Server-defined arbitrary keys
    Object.entries(sfxFilesObj || {}).forEach(([k, file]) => {
      const key = String(k || "").trim();
      const fn  = String(file || "").trim();
      if (!key || !fn) return;
      out[key] = `${sfxDir}/${fn}`;
    });

    return out;
  }

  function createSFX(){
    let enabled = true;
    let volume = 0.35;
    let sources = {};
    let unlocked = false;

    function unlockOnce(){
      if (unlocked) return;
      unlocked = true;
      try{
        const a = new Audio(sources.click || "");
        a.muted = true;
        a.play().catch(()=>{});
      }catch(e){}
    }
    window.addEventListener("pointerdown", unlockOnce, { once:true });

    function play(name){
      if (!enabled) return;
      unlockOnce();
      const key = String(name || "").trim();
      const src = sources[key];
      if (!src){
        console.warn(`[SFX] 找不到音效 key="${key}"（請到 ui.html 新增 sfxFiles）`);
        return;
      }
      try{
        const a = new Audio(src);
        a.volume = volume;
        a.play().catch(()=>{});
      }catch(e){
        console.warn("[SFX] play exception", e);
      }
    }

    return {
      api: { play, get pageKey(){ return pageKey; } },
      setEnabled(v){ enabled = !!v; },
      setVolume(v){ volume = clamp01(v); },
      setSources(m){ sources = m || {}; }
    };
  }

  // ===== Background CSS injection =====
  function injectBackgroundCSS(){
    if (document.getElementById("bg-css")) return;
    const st = document.createElement("style");
    st.id = "bg-css";
    st.textContent = `
      :root{ --bg-img:none; --bg-opacity:0.18; --bg-blur:0px; }
      body{ position:relative; min-height:100vh; overflow-x:hidden; }
      body::before{
        content:"";
        position:fixed; inset:0;
        background:var(--bg-img) center/cover no-repeat;
        opacity: var(--bg-opacity);
        filter: blur(var(--bg-blur));
        pointer-events:none;
        z-index:0;
      }
      body > * { position:relative; z-index:1; }
    `;
    document.head.appendChild(st);
  }

  function guessPageKey(){
    const p = (location.pathname || "").toLowerCase();
    if (p.includes("admin")) return "admin";
    if (p.includes("shop")) return "shop";
    if (p.includes("display")) return "display";
    if (p.includes("super")) return "super";
    return "player";
  }

  function clamp01(v){ v = Number(v); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.35; }
  function clampNum(v, lo, hi){ v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; }
})();
