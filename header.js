// header.js (丸ごと差し替え)
document.addEventListener("DOMContentLoaded", () => {
  // 現在のページの階層状況（/kourin/ などサブフォルダ内にあるか）を判定してパスの頭（basePath）を決める
  const isSubFolder = window.location.pathname.includes('/kourin/');
  const basePath = isSubFolder ? '../' : './';

  const headerHTML = `
    <header class="site-header">
      <!-- 💡 三本線（ハンバーガー）ボタン -->
      <button class="menu-toggle" id="menu-toggle" aria-label="メニューを開く">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <h1 class="site-title">ねずみかの攻略サイト</h1>
    </header>

    <!-- 💡 左から出てくるメニュー本体 -->
    <nav class="side-nav" id="side-nav">
      <ul>
        <li><a href="${basePath}index.html">トップ</a></li>
        <li><a href="${basePath}yokuarubanmen.html">よくある盤面</a></li>
        <li><a href="${basePath}kourin.html">降臨</a></li>
      </ul>
    </nav>
    <!-- 💡 メニューが開いている時の背景の暗幕 -->
    <div class="nav-overlay" id="nav-overlay"></div>
  `;

  const placeholder = document.getElementById("header-placeholder");
  if (placeholder) {
    placeholder.outerHTML = headerHTML;

    // --- ✨ ここからクリック時の動きの処理 ✨ ---
    const menuToggle = document.getElementById("menu-toggle");
    const sideNav = document.getElementById("side-nav");
    const overlay = document.getElementById("nav-overlay");

    // ボタンを押した時、または背景を押した時の処理
    const toggleMenu = () => {
      menuToggle.classList.toggle("open"); // ボタンを「×」にする
      sideNav.classList.toggle("open");    // メニューを出す
      overlay.classList.toggle("open");    // 背景を暗くする
    };

    menuToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);
    
    // メニュー内のリンクを押したら自動で閉じる
    sideNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
  }
});