const PERM_CATALOG = [
  { key:'superPanel', label:'可見 SUPER 面板' },
  { key:'managePerms', label:'可修改他人權限' },
  { key:'lockAdmin', label:'可鎖/解鎖 Admin' },
  { key:'lockPlayer', label:'可鎖/解鎖 Player' },
  { key:'manageDevices', label:'可管理裝置清單' },
  { key:'reviewRequests', label:'可審核請求' },
  { key:'broadcastControl', label:'可控制跑馬燈' },
  { key:'danmakuControl', label:'可控制彈幕' },
  { key:'systemControl', label:'可改系統參數/強制登出' } // 對應你 22.js 那些功能:contentReference[oaicite:3]{index=3}
];

function assertManagePerms(){
  if(!LR.canPerm('managePerms')) {
    alert('權限不足：managePerms');
    throw new Error('PERMISSION_DENIED_managePerms');
  }
}

async function initPermManager(){
  // 只有有 managePerms 的人才能使用
  const permPanel = document.getElementById('permPanel');
  if(!permPanel) return;

  if(LR.canPerm('managePerms')) permPanel.classList.remove('hide');
  else permPanel.classList.add('hide');

  if(!LR.canPerm('managePerms')) return;

  // 1) 載入所有 users 做下拉（你也可以改成只載 admin/player）
  const usersSnap = await db.ref('users').once('value');
  const select = document.getElementById('permUserSelect');
  select.innerHTML = '';
  usersSnap.forEach(ch=>{
    const uid = ch.key;
    const role = ch.val()?.role || '';
    const opt = document.createElement('option');
    opt.value = uid;
    opt.textContent = `${uid.slice(0,6)}... (${role})`;
    select.appendChild(opt);
  });

  // 2) 畫 checkbox
  const grid = document.getElementById('permCheckboxGrid');
  grid.innerHTML = PERM_CATALOG.map(p=>`
    <label class="res-row" style="cursor:pointer;">
      <input type="checkbox" data-perm="${p.key}" style="width:18px;height:18px;margin-right:10px;">
      <div style="font-weight:800;">${p.label}</div>
      <div style="margin-left:auto; opacity:.7;">${p.key}</div>
    </label>
  `).join('');

  async function loadTargetPerms(){
    assertManagePerms();

    const targetUid = select.value;
    const snap = await db.ref(`users/${targetUid}/perms`).once('value');
    const perms = snap.val() || {};

    grid.querySelectorAll('input[type=checkbox][data-perm]').forEach(cb=>{
      const k = cb.getAttribute('data-perm');
      cb.checked = perms[k] === true;
    });

    setHint('已載入', 'var(--ok)');
  }

  function collectPermsFromUI(){
    const out = {};
    grid.querySelectorAll('input[type=checkbox][data-perm]').forEach(cb=>{
      const k = cb.getAttribute('data-perm');
      if(cb.checked) out[k] = true;
    });
    return out;
  }

  function setHint(text, color){
    const hint = document.getElementById('permSaveHint');
    hint.textContent = text;
    hint.style.color = color || 'inherit';
  }

  // 3) 事件
  document.getElementById('btnPermReload')?.addEventListener('click', loadTargetPerms);
  select.addEventListener('change', loadTargetPerms);

  document.getElementById('btnPermSave')?.addEventListener('click', async ()=>{
    assertManagePerms();
    const targetUid = select.value;

    // 安全：避免把自己唯一的 managePerms 拔掉造成鎖死（可視需求移除）
    const me = auth.currentUser?.uid;
    const permsToSave = collectPermsFromUI();
    if(targetUid === me && permsToSave.managePerms !== true){
      alert('安全機制：不允許把自己 managePerms 取消（避免鎖死）');
      return;
    }

    await db.ref(`users/${targetUid}/perms`).set(permsToSave);
    setHint('已儲存', 'var(--ok)');
  });

  document.getElementById('btnPermReset')?.addEventListener('click', async ()=>{
    assertManagePerms();
    const targetUid = select.value;
    if(!confirm('確定要清空該用戶 perms？')) return;

    await db.ref(`users/${targetUid}/perms`).set(null);
    await loadTargetPerms();
    setHint('已清空', 'var(--warn)');
  });

  // 初次載入第一個
  if(select.options.length) await loadTargetPerms();
}
