// Shared helpers for all pages (Life Resume v3)
(function(){
  'use strict';

  // ===== Stable device id (localStorage) =====
  function getDeviceId(){
    const k='lifeResume_deviceId_v3';
    let id = localStorage.getItem(k);
    if(!id){
      id = 'dev_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
      localStorage.setItem(k,id);
    }
    return id;
  }

  // ===== Listener registry: prevent duplicate .on() bindings =====
  const _listenerRegistry = new Map();
  function listen(path, event, handler){
    if(!window.db) throw new Error('db not initialized');
    const key = event + '|' + path;
    const ref = db.ref(path);
    const old = _listenerRegistry.get(key);
    if(old){
      ref.off(event, old);
    }
    _listenerRegistry.set(key, handler);
    ref.on(event, handler);
    return () => { ref.off(event, handler); _listenerRegistry.delete(key); };
  }

  // ===== Device seen heartbeat (best effort) =====
  async function markDeviceSeen(role, extra){
    try{
      if(!window.db) return;
      const deviceId=getDeviceId();
      const payload = Object.assign({
        deviceId,
        role: role || 'unknown',
        userAgent: navigator.userAgent || '',
        ts: Date.now()
      }, extra||{});
      await db.ref('devices/seen/'+deviceId).update(payload);
    }catch(e){}
  }

  // ===== Background injection (one-time) =====
  function applyBackground(){
    try{
      if(document.getElementById('lr-bg-style')) return;

      const svg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
          <defs>
            <radialGradient id="g" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.9)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </radialGradient>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="rgba(15,23,42,0.08)"/>
            </pattern>
          </defs>
          <rect width="640" height="640" fill="url(#dots)"/>
          <circle cx="120" cy="120" r="220" fill="url(#g)"/>
          <circle cx="520" cy="160" r="260" fill="url(#g)"/>
          <circle cx="320" cy="560" r="280" fill="url(#g)"/>
        </svg>
      `);

      const style = document.createElement('style');
      style.id = 'lr-bg-style';
      style.textContent = `
        html,body{height:100%;}
        body{ background-attachment: fixed !important; }
        body::before{
          content:"";
          position:fixed;
          inset:0;
          z-index:-2;
          background-image:url("data:image/svg+xml,${svg}");
          background-size: 920px 920px;
          background-repeat: repeat;
          opacity: 0.55;
          pointer-events:none;
        }
        body::after{
          content:"";
          position:fixed;
          inset:-20%;
          z-index:-3;
          background:
            radial-gradient(900px 420px at 16% 0%, rgba(59,130,246,0.18), transparent 60%),
            radial-gradient(900px 420px at 84% 0%, rgba(34,197,94,0.16), transparent 60%),
            radial-gradient(900px 520px at 50% 110%, rgba(139,92,246,0.16), transparent 65%),
            linear-gradient(-45deg, rgba(246,248,251,1), rgba(233,240,247,1), rgba(255,255,255,1), rgba(240,244,248,1));
          background-size: auto, auto, auto, 400% 400%;
          animation: lrGradientBG 18s ease infinite;
          pointer-events:none;
        }
        @keyframes lrGradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(style);
    }catch(e){}
  }

  // Auto-apply background after DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyBackground);
  }else{
    applyBackground();
  }

  window.LR = { getDeviceId, listen, markDeviceSeen, applyBackground };
})();
