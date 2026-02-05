// /js/site-ui-db.js
// 從 Firebase /system/uiConfig 讀取「背景＋音效」設定，套用到每一頁。
// 需求：頁面已載入 firebase-app-compat.js 與 firebase-database-compat.js
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

  const LS_KEY = "site_sfx_settings_v2";
  const local = safeJSON(localStorage.getItem(LS_KEY)) || {};
  let userEnabled = (local.enabled ?? null); // null => follow server
  let userVolume = (local.volume ?? null);   // null => follow server

  let runtime = null;

  uiRef.on("value", (snap) => {
    runtime = snap.val() || {};
    applyAll();
  });

  function applyAll(){
    const d = runtime.defaults || {};
    const imagesDir = d.imagesDir || "./images";
    const sfxDir = d.sfxDir || "./sfx";

    const bgOpacity = clamp01(d.bgOpacity ?? 0.18);
    const bgBlurPx = clampNum(d.bgBlurPx ?? 0, 0, 40);
    const bgDefault = (d.bgDefault || "").trim();
    const bgFile = ((runtime.backgrounds || {})[pageKey] || bgDefault || "").trim();
    const bgUrl = bgFile ? `url('${imagesDir}/${bgFile}')` : "none";

    document.documentElement.style.setProperty("--bg-img", bgUrl);
    document.documentElement.style.setProperty("--bg-opacity", String(bgOpacity));
    document.documentElement.style.setProperty("--bg-blur", `${bgBlurPx}px`);

    const serverEnabled = (d.sfxEnabled ?? true) === true;
    const serverVolume = clamp01(d.sfxVolume ?? 0.35);
    const enabled = (userEnabled === null) ? serverEnabled : !!userEnabled;
    const volume = (userVolume === null) ? serverVolume : clamp01(userVolume);

    const f = runtime.sfxFiles || {};
    const src = {
      click: `${sfxDir}/${(f.click || "click.mp3")}`,
      ok: `${sfxDir}/${(f.ok || "ok.mp3")}`,
      alert: `${sfxDir}/${(f.alert || "alert.mp3")}`,
      danmaku: `${sfxDir}/${(f.danmaku || "danmaku.mp3")}`,
      error: `${sfxDir}/${(f.error || "error.mp3")}`,
    };

    ensureSFX(src, enabled, volume);
    ensurePanel();
    refreshPanel(enabled, volume);
  }

  // ---- SFX core ----
  let sfx = null;
  function ensureSFX(srcMap, enabled, volume){
    if (!sfx){
      sfx = createSFX();
      window.SFX = sfx.api;
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

    function persist(){
      localStorage.setItem(LS_KEY, JSON.stringify({ enabled: userEnabled, volume: userVolume }));
    }

    return {
      api: {
        play,
        setUserEnabled(v){
          userEnabled = !!v;
          persist();
          applyAll();
        },
        setUserVolume(v){
          userVolume = clamp01(v);
          persist();
          applyAll();
        },
        resetUserOverride(){
          userEnabled = null;
          userVolume = null;
          persist();
          applyAll();
        },
        get pageKey(){ return pageKey; }
      },
      setEnabled(v){ enabled = !!v; },
      setVolume(v){ volume = clamp01(v); },
      setSources(m){ sources = m || {}; }
    };
  }

  // ---- Panel ----
  function ensurePanel(){
    if (document.getElementById("sfx-panel")) return;

    const panel = document.createElement("div");
    panel.id = "sfx-panel";
    panel.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;min-width:220px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <b style="font-weight:1000;">音效</b>
          <button id="sfx-reset" style="border:none;border-radius:10px;padding:6px 10px;cursor:pointer;background:rgba(2,6,23,0.06);font-weight:900;">
            跟隨系統
          </button>
        </div>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input id="sfx-toggle" type="checkbox" style="width:18px;height:18px;">
          <span style="font-weight:900;">啟用</span>
        </label>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-weight:900;">音量</span>
          <input id="sfx-volume" type="range" min="0" max="100" step="1" style="flex:1;">
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    const st = document.createElement("style");
    st.textContent = `
      #sfx-panel{
        position:fixed; right:14px; bottom:14px;
        z-index:9999;
        background: rgba(255,255,255,0.82);
        border:1px solid rgba(2,6,23,0.12);
        border-radius:14px;
        padding:10px 12px;
        box-shadow:0 10px 26px rgba(2,6,23,0.12);
        backdrop-filter: blur(6px);
        font-family: system-ui, -apple-system, "Segoe UI", "Microsoft JhengHei", sans-serif;
        color:#0f172a;
      }
      @media (max-width: 520px){
        #sfx-panel{ left:14px; right:14px; }
      }
    `;
    document.head.appendChild(st);

    panel.querySelector("#sfx-toggle").addEventListener("change", (e) => {
      window.SFX?.setUserEnabled(e.target.checked);
      window.SFX?.play("click");
    });
    panel.querySelector("#sfx-volume").addEventListener("input", (e) => {
      window.SFX?.setUserVolume(Number(e.target.value) / 100);
    });
    panel.querySelector("#sfx-reset").addEventListener("click", () => {
      window.SFX?.resetUserOverride();
      window.SFX?.play("click");
    });
  }

  function refreshPanel(enabled, volume){
    const chk = document.getElementById("sfx-toggle");
    const rng = document.getElementById("sfx-volume");
    if (chk) chk.checked = !!enabled;
    if (rng) rng.value = String(Math.round(clamp01(volume) * 100));
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
  function safeJSON(s){ try { return JSON.parse(s); } catch { return null; } }
})();
