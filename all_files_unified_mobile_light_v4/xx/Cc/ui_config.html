<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>UI 背景設定</title>

  <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-database-compat.js"></script>
</head>

<body data-page="ui">

<h2>🎨 背景設定（固定 + 指定檔名）</h2>

<p><b>固定資料夾：</b><code>/images/backgrounds/</code></p>
<ul>
  <li>player → bg-player.jpg</li>
  <li>admin → bg-admin.jpg</li>
  <li>shop → bg-shop.jpg</li>
  <li>display → bg-display.jpg</li>
  <li>super → bg-super.jpg</li>
</ul>

<hr>

<label>背景透明度（0~1）</label><br>
<input id="bgOpacity" type="number" step="0.01" value="0.18"><br><br>

<label>背景模糊（px）</label><br>
<input id="bgBlurPx" type="number" value="0"><br><br>

<label>臨時背景檔名（可空）</label><br>
<input id="bgOverride" placeholder="例如：bg-player-alt.jpg"><br>
<small>※ 檔案必須放在 <code>/images/backgrounds/</code></small>

<br><br>

<button id="save">💾 儲存</button>
<button id="clear">🧹 清除覆蓋</button>

<script>
const firebaseConfig = {
  apiKey: "AIzaSyB0Gvpk5Y6ZermG67lFm-ecaXYGL5pl7mk",
  authDomain: "try-something-ddd1e.firebaseapp.com",
  databaseURL: "https://try-something-ddd1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "try-something-ddd1e",
  storageBucket: "try-something-ddd1e.firebasestorage.app",
  messagingSenderId: "245905464126",
  appId: "1:4aea37e1b2bb0bdd1a2a6f"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const ref = firebase.database().ref("system/uiConfig");

// 這裡指定你要改哪一頁（player / admin / shop / display / super）
const pageKey = "player";

ref.on("value", snap => {
  const v = snap.val() || {};
  document.getElementById("bgOpacity").value = v.defaults?.bgOpacity ?? 0.18;
  document.getElementById("bgBlurPx").value  = v.defaults?.bgBlurPx ?? 0;
  document.getElementById("bgOverride").value = v.bgOverride?.[pageKey] || "";
});

save.onclick = async () => {
  await ref.child("defaults").update({
    bgOpacity: Number(bgOpacity.value),
    bgBlurPx: Number(bgBlurPx.value)
  });
  await ref.child("bgOverride").child(pageKey).set(bgOverride.value.trim());
  await ref.update({ updatedAt: Date.now() });
  alert("已儲存背景設定");
};

clear.onclick = async () => {
  await ref.child("bgOverride").child(pageKey).remove();
  await ref.update({ updatedAt: Date.now() });
  alert("已清除覆蓋，回到固定背景");
};
</script>

</body>
</html>