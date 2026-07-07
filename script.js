/* ==========================================================================
   まったり雑談喫茶 公式HP JavaScript (script.js)
   機能: ナビゲーション制御、スクロール演出、Discord Widget動的取得
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ヘッダースクロール効果 ---
  const header = document.querySelector('.main-header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // 初期スクロール位置のチェック
  handleScroll();


  // --- 2. モバイルナビゲーションメニューの開閉 ---
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // メニュー外クリックで閉じる
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && e.target !== menuToggle) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });

    // リンククリック時に閉じる
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }


  // --- 3. スクロール連動ふわっとアニメーション (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.scroll-reveal, .fade-in-up, .fade-in');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // 一度表示されたら監視を終了する（アニメーションは1回のみ）
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // ビューポートを基準にする
      threshold: 0.1, // 10%が見えたら発火
      rootMargin: '0px 0px -40px 0px' // 少し早めに発火させる調整
    });

    revealElements.forEach(el => revealObserver.observe(el));
    
    // ヒーローセクションのアニメーションはローディング後すぐに発火させる
    const heroElements = document.querySelectorAll('.hero-content, .hero-visual');
    setTimeout(() => {
      heroElements.forEach(el => el.classList.add('active'));
    }, 100);

  } else {
    // IntersectionObserver非対応ブラウザ用のフォールバック（即座にクラス付与）
    revealElements.forEach(el => el.classList.add('active'));
  }


  // --- 4. Discord Widget API 連動 (オンライン人数の動的更新) ---
  // TODO: Discordサーバー設定の「ウェブウィジェット」を有効にし、
  // 以下の guildId にあなたのサーバーの「サーバーID」を設定してください。
  const DISCORD_GUILD_ID = ''; // 例: '123456789012345678'
  const memberCountElement = document.getElementById('memberCount');

  if (DISCORD_GUILD_ID && memberCountElement) {
    const fetchDiscordStatus = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // オンラインメンバー数、またはトータルメンバー数の取得
        // ※Widget APIの仕様上、取得できるのは「現在のオンライン人数 (presence_count)」となります
        if (data.presence_count !== undefined) {
          memberCountElement.textContent = data.presence_count;
          const statusTextElement = document.querySelector('.server-status .status-text');
          if (statusTextElement) {
            statusTextElement.innerHTML = `メンバー <strong>${data.presence_count}</strong> 名がオンライン`;
          }
        }
        
        // ついでに招待用リンクもWidgetのものに自動で置き換えることも可能です
        if (data.instant_invite) {
          const joinButtons = document.querySelectorAll('#hero-join-btn, #cta-join-btn, .btn-nav');
          joinButtons.forEach(btn => {
            if (btn.getAttribute('href').includes('YOUR_INVITE_CODE')) {
              btn.setAttribute('href', data.instant_invite);
            }
          });
        }
      } catch (error) {
        console.warn('Discord Widgetデータの取得に失敗しました。デフォルト値を使用します。:', error);
      }
    };

    fetchDiscordStatus();
    // 5分ごとに人数を更新
    setInterval(fetchDiscordStatus, 5 * 60 * 1000);
  }

});
