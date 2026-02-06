// /js/site-ui-db.js
// 從 Firebase /system/uiConfig 讀取「背景＋音效」設定，套用到每一頁。
// ✅ 本版本：移除每頁音效控制 UI；音效完全由 /system/uiConfig 控制（不允許使用者覆寫）

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

  const pageKey = (document.body.dataset.page || "").trim() || guessPageKey();
  injectBackgroundCSS();

  // ✅ 不允許使用者覆寫（全部跟系統）
  let runtime = null;

  uiRef.on("value", (snap) => {
    runtime = snap.val() || {};
    applyAll();
  });

  function applyAll(){
    const d = runtime.defaults || {};
    const imagesDir = d.imagesDir || "./images";
    const sfxDir = d.sfxDir || "./sfx";

    // ---- Background ----
    const bgOpacity = clamp01(d.bgOpacity ?? 0.18);
    const bgBlurPx = clampNum(d.bgBlurPx ?? 0, 0, 40);
    const bgDefault = (d.bgDefault || "").trim();
    const bgFile = ((runtime.backgrounds || {})[pageKey] || bgDefault || "").trim();
    const bgUrl = bgFile ? `url('${imagesDir}/${bgFile}')` : "none";

    document.documentElement.style.setProperty("--bg-img", bgUrl);
    document.documentElement.style.setProperty("--bg-opacity", String(bgOpacity));
    document.documentElement.style.setProperty("--bg-blur", `${bgBlurPx}px`);

    // ---- SFX (system-only) ----
    const enabled = (d.sfxEnabled ?? true) === true;
    const volume = clamp01(d.sfxVolume ?? 0.35);

    const f = runtime.sfxFiles || {};
    const src = {
      click: `${sfxDir}/${(f.click || "click.mp3")}`,
      ok: `${sfxDir}/${(f.ok || "ok.mp3")}`,
      alert: `${sfxDir}/${(f.alert || "alert.mp3")}`,
      danmaku: `${sfxDir}/${(f.danmaku || "danmaku.mp3")}`,
      error: `${sfxDir}/${(f.error || "error.mp3")}`,
    };

    ensureSFX(src, enabled, volume);

    // ❌ 不再注入任何音效 UI（panel）
    // （使用者端不能控制，全部由 ui_config 控制）
  }

  // ---- SFX core ----
  let sfx = null;

  function ensureSFX(srcMap, enabled, volume){
    if (!sfx){
      sfx = createSFX();
      window.SFX = sfx.api; // ✅ 全站可用：SFX.play("click")...
    }
    sfx.setSources(srcMap);
    sfx.setEnabled(enabled);
    sfx.setVolume(volume);
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
      const src = sources[name];
      if (!src) return;
      const a = new Audio(src);
      a.volume = volume;
      a.play().catch(()=>{});
    }

    return {
      api: {
        play,
        // ✅ 不提供 setUserEnabled / setUserVolume / resetUserOverride
        // 因為你要「全部由 ui_config 控制」
        get pageKey(){ return pageKey; }
      },
      setEnabled(v){ enabled = !!v; },
      setVolume(v){ volume = clamp01(v); },
      setSources(m){ sources = m || {}; }
    };
  }

  // ---- Background CSS ----
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
        background-image: var(--bg-img);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: var(--bg-opacity);
        filter: blur(var(--bg-blur));
        pointer-events:none;
        z-index:0;
      }
      .wrap,.menu,.container,.main,.app,#admin-main,#main,#display-header{
        position:relative; z-index:1;
      }
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