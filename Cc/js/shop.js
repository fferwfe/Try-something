// js/shop.js

/* ========= 設定 ========= */
const SHOP_PASSWORD = "345721";
const KEY = "shop_gate_ok";

const BASE_PATH = "images/shop/";
const LIST_FILE = "images.json";

/* ========= DOM ========= */
const gate = document.getElementById("gate");
const btnEnter = document.getElementById("btnShopEnter");
const passEl = document.getElementById("shopPass");

const bar = document.getElementById("shop-status");
const btnToggle = document.getElementById("btnToggleShop");

const itemName = document.getElementById("itemName");
const itemImageUrl = document.getElementById("itemImageUrl");
const itemImageLocal = document.getElementById("itemImageLocal");
const preview = document.getElementById("itemImagePreview");

const resInputs = document.getElementById("res-inputs");
const itemsDisplay = document.getElementById("items-display");

/* ========= Gate ========= */
function openAdmin(){
  if (gate) gate.style.display = "none";
}
function closeAdmin(){
  if (gate) gate.style.display = "flex";
}

if (sessionStorage.getItem(KEY) === "1") openAdmin();
else closeAdmin();

btnEnter?.addEventListener("click", () => {
  if (passEl.value === SHOP_PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    openAdmin();
  } else alert("密碼錯誤");
});

/* ========= 商店開關 ========= */
let isShopOpen = false;
db.ref("shopSettings/isOpen").on("value", s => {
  isShopOpen = s.val() || false;
  bar.textContent = isShopOpen ? "✅ 商店營業中" : "❌ 商店關閉中";
  bar.className = "status-bar " + (isShopOpen ? "open" : "closed");
});
btnToggle?.addEventListener("click", () => {
  db.ref("shopSettings/isOpen").set(!isShopOpen);
});

/* ========= 資源（保留你原結構） ========= */
const resTypes = { time:'時間', money:'金錢', health:'健康', knowledge:'知識', social:'人際' };
let tempRes = { time:0, money:0, health:0, knowledge:0, social:0 };
let bonusScore = 0;

resInputs.innerHTML = Object.keys(resTypes).map(k => `
  <div class="res-setter">
    <span>${resTypes[k]}代價</span>
    <div>
      <button type="button" onclick="updateTemp('${k}',-1)">-</button>
      <span class="val" id="t-${k}">0</span>
      <button type="button" onclick="updateTemp('${k}',1)">+</button>
    </div>
  </div>
`).join("");

window.updateTemp = (k, v) => {
  tempRes[k] = Math.max(0, tempRes[k] + v);
  document.getElementById(`t-${k}`).innerText = tempRes[k];
};
window.updateBonus = (v) => {
  bonusScore = Math.max(0, bonusScore + v);
  document.getElementById("t-score").innerText = bonusScore;
};

/* ========= 圖片：images.json + URL（本地優先） ========= */
function setPreview(src){
  const s = (src || "").trim();
  if (!s) { preview.style.display = "none"; preview.src = ""; return; }
  preview.src = s;
  preview.style.display = "block";
}

async function loadImageList(){
  itemImageLocal.innerHTML = `<option value="">（不選本地圖片）</option>`;
  try{
    const res = await fetch(LIST_FILE, { cache: "no-store" });
    if(!res.ok) throw new Error("images.json not found");
    const list = await res.json();

    list.forEach(fn => {
      const file = String(fn || "").trim();
      if(!file) return;
      const opt = document.createElement("option");
      opt.value = BASE_PATH + file;   // ✅ 重要：上站後正確路徑就是 images/shop/xxx
      opt.textContent = file;
      itemImageLocal.appendChild(opt);
    });
  }catch(err){
    console.warn("讀取 images.json 失敗：", err);
  }
}
loadImageList();

itemImageLocal.addEventListener("change", () => {
  setPreview(itemImageLocal.value || itemImageUrl.value);
});
itemImageUrl.addEventListener("input", () => {
  if (!itemImageLocal.value) setPreview(itemImageUrl.value);
});

/* ========= 上架 ========= */
document.getElementById("btnAddItem")?.addEventListener("click", async () => {
  const name = itemName.value.trim();
  if (!name) return alert("請輸入商品名稱");

  const localImg = (itemImageLocal.value || "").trim();
  const urlImg = (itemImageUrl.value || "").trim();

  // ✅ 統一圖片欄位：image 是主要欄位，同時寫入 imageUrl 以相容舊 player
  const image = localImg || urlImg || "";

  try{
    await db.ref("shop/items").push({
      name,
      cost: { ...tempRes },
      bonus: bonusScore,
      image,             // ✅ 新版主要欄位
      imageUrl: image,   // ✅ 相容舊 player.html（只看 imageUrl）
      imageType: localImg ? "local" : (urlImg ? "url" : "")
    });

    alert("上架成功！");
    location.reload();
  }catch(err){
    console.error(err);
    alert("上架失敗：" + (err?.message || err));
  }
});

/* ========= 商品列表（管理端預覽） ========= */
db.ref("shop/items").on("value", s => {
  itemsDisplay.innerHTML = "";
  const data = s.val();
  if (!data) {
    itemsDisplay.innerHTML = `<p style="color:var(--muted); text-align:center;">目前沒有商品</p>`;
    return;
  }

  Object.entries(data).forEach(([key, item]) => {
    const imgSrc = String((item.image || item.imageUrl || "")).trim(); // ✅ 同時支援
    const costs = Object.entries(item.cost || {})
      .filter(([_,v]) => v > 0)
      .map(([k,v]) => `${resTypes[k]}:${v}`).join(' / ');

    itemsDisplay.innerHTML += `
      <div class="shop-item">
        ${imgSrc
          ? `<img class="item-img" src="${imgSrc}" alt="item">`
          : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;color:rgba(15,23,42,0.55);font-weight:900;">No Img</div>`
        }
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <div class="item-meta">
            <span style="color:var(--warn)">🏆 分數 +${item.bonus || 0}</span><br>
            <span style="color:var(--danger)">💰 代價: ${costs || '免費'}</span>
          </div>
        </div>

        <button class="delete-btn admin-only" data-key="${key}">下架</button>
      </div>
    `;
  });

  document.querySelectorAll(".admin-only").forEach(btn => {
    btn.style.display = (sessionStorage.getItem(KEY) === "1") ? "inline-block" : "none";
    btn.onclick = () => {
      const k = btn.getAttribute("data-key");
      if (confirm("確定下架？")) db.ref(`shop/items/${k}`).remove();
    };
  });
});
