/* ============================================
   COFFEE POS — APP.JS
   Config, Navigation, Theme, Init
   (โหลดท้ายสุด)
   ============================================ */

/* === GLOBAL STATE === */
var APP = {
  currentView: 'pos',
  currentStaff: null,
  clockInterval: null,
  isMobile: false
};

/* ============================================
   NAVIGATION
   ============================================ */
function nav(view) {
  var validViews = ['pos', 'menu', 'orders', 'report', 'stock', 'admin'];
  if (validViews.indexOf(view) === -1) view = 'pos';

  APP.currentView = view;

  /* Update sidebar nav items */
  var sideItems = qsa('.nav-item');
  for (var i = 0; i < sideItems.length; i++) {
    var v = sideItems[i].getAttribute('data-view');
    if (v === view) {
      addClass(sideItems[i], 'active');
    } else {
      removeClass(sideItems[i], 'active');
    }
  }

  /* Update bottom nav items */
  var bnavItems = qsa('.bnav-item');
  for (var j = 0; j < bnavItems.length; j++) {
    var bv = bnavItems[j].getAttribute('data-view');
    if (bv === view) {
      addClass(bnavItems[j], 'active');
    } else {
      removeClass(bnavItems[j], 'active');
    }
  }

  /* Close sidebar on mobile */
  if (APP.isMobile) {
    closeSidebar();
  }

  /* Render view */
  renderView(view);
}

function renderView(view) {
  var main = $('mainContent');
  if (!main) return;

  switch (view) {
    case 'pos':
      if (typeof renderPOSView === 'function') renderPOSView();
      break;
    case 'menu':
      if (typeof renderMenuView === 'function') renderMenuView();
      break;
    case 'orders':
      if (typeof renderOrdersView === 'function') renderOrdersView();
      break;
    case 'report':
      if (typeof renderReportView === 'function') renderReportView();
      break;
    case 'stock':
      if (typeof renderStockView === 'function') renderStockView();
      break;
    case 'admin':
      if (typeof renderAdminView === 'function') renderAdminView();
      break;
    default:
      main.innerHTML = '<div class="empty-state"><div class="empty-icon">🚧</div><div class="empty-text">Coming soon...</div></div>';
  }
}

/* ============================================
   SIDEBAR
   ============================================ */
function toggleSidebar() {
  var sidebar = $('sidebar');
  var overlay = $('sidebarOverlay');
  if (!sidebar) return;

  if (hasClass(sidebar, 'open')) {
    closeSidebar();
  } else {
    addClass(sidebar, 'open');
    addClass(overlay, 'show');
  }
}

function closeSidebar() {
  removeClass('sidebar', 'open');
  removeClass('sidebarOverlay', 'show');
}

/* ============================================
   THEME
   ============================================ */
function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);

  /* Update icon */
  setText('themeIcon', next === 'dark' ? '🌙' : '☀️');

  /* Update meta theme-color */
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', next === 'dark' ? '#0f0f1a' : '#f5f5f5');
  }

  /* Save */
  var cfg = ST.getConfig();
  cfg.theme = next;
  ST.saveConfig(cfg);

  toast(next === 'dark' ? 'Dark Mode' : 'Light Mode', 'info', 1200);
}

function applyTheme() {
  var cfg = ST.getConfig();
  var theme = cfg.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  setText('themeIcon', theme === 'dark' ? '🌙' : '☀️');

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0f0f1a' : '#f5f5f5');
  }
}

/* ============================================
   SHOP NAME
   ============================================ */
function applyShopName() {
  var cfg = ST.getConfig();
  setText('shopName', cfg.shopName || 'Coffee POS');
  document.title = cfg.shopName || 'Coffee POS';
}

/* ============================================
   CLOCK
   ============================================ */
function startClock() {
  updateClock();
  APP.clockInterval = setInterval(updateClock, 1000);
}

/* ============================================
   RESPONSIVE CHECK
   ============================================ */
function checkMobile() {
  APP.isMobile = window.innerWidth < 768;
}

/* ============================================
   SYNC BUTTON
   ============================================ */
function showSync() {
  if (typeof firebaseSync === 'function') {
    firebaseSync();
  } else {
    toast('Firebase ยังไม่ได้ตั้งค่า', 'info');
  }
}

/* ============================================
   AUTH (placeholder — firebase-sync.js จะ override)
   ============================================ */
function handleAuth() {
  if (typeof firebaseAuth === 'function') {
    firebaseAuth();
  } else {
    toast('Firebase ยังไม่ได้ตั้งค่า', 'info');
  }
}

/* ============================================
   PWA SERVICE WORKER
   ============================================ */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
      console.log('[SW] registered:', reg.scope);
    }).catch(function(err) {
      console.log('[SW] failed:', err);
    });
  }
}

/* ============================================
   SEED DATA CHECK
   ============================================ */
function checkSeedData() {
  if (!ST.hasSampleData()) {
    /* First time — show welcome & seed */
    var html = '';
    html += '<div class="text-center">';
    html += '<div style="font-size:64px;margin-bottom:16px;">☕</div>';
    html += '<div class="fw-800 fs-xl mb-8">ยินดีต้อนรับ!</div>';
    html += '<div class="text-muted mb-20">เริ่มต้นใช้งาน Coffee POS<br>ต้องการเพิ่มเมนูตัวอย่างไหม?</div>';
    html += '</div>';

    var footer = '';
    footer += '<button class="btn btn-secondary" onclick="closeMForce(); nav(\'menu\');">ข้าม — เพิ่มเอง</button>';
    footer += '<button class="btn btn-primary" onclick="doSeedData()">✅ เพิ่มเมนูตัวอย่าง</button>';

    openModal('🚀 เริ่มต้นใช้งาน', html, footer);
  }
}

function doSeedData() {
  ST.seedSampleData();
  closeMForce();
  nav('pos');
}

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
function initShortcuts() {
  document.addEventListener('keydown', function(e) {
    /* Ctrl+P override for receipt */
    /* Let default print handle it — our @media print CSS takes care */

    /* F1 = POS */
    if (e.key === 'F1') { e.preventDefault(); nav('pos'); }
    /* F2 = Orders */
    if (e.key === 'F2') { e.preventDefault(); nav('orders'); }
    /* F3 = Report */
    if (e.key === 'F3') { e.preventDefault(); nav('report'); }
  });
}

/* ============================================
   WINDOW RESIZE
   ============================================ */
function onResize() {
  checkMobile();
  /* Re-render current view if needed */
  if (APP.currentView === 'pos' && typeof updatePOSLayout === 'function') {
    updatePOSLayout();
  }
}

var debouncedResize = debounce(onResize, 250);

/* ============================================
   LOW STOCK ALERT
   ============================================ */
function checkLowStock() {
  var low = ST.getLowStock();
  if (low.length > 0) {
    toast('⚠️ วัตถุดิบใกล้หมด ' + low.length + ' รายการ', 'warning', 4000);
  }
}

/* ============================================
   INIT
   ============================================ */
function initApp() {
  console.log('[app.js] initializing...');

  /* 1. Check mobile */
  checkMobile();

  /* 2. Apply theme */
  applyTheme();

  /* 3. Apply shop name */
  applyShopName();

  /* 4. Start clock */
  startClock();

  /* 5. Register Service Worker */
  registerSW();

  /* 6. Init keyboard shortcuts */
  initShortcuts();

  /* 7. Window resize */
  window.addEventListener('resize', debouncedResize);

  /* 8. Hide splash, show app */
  setTimeout(function() {
    var splash = $('splash');
    var app = $('app');
    if (splash) addClass(splash, 'hide');
    if (app) app.style.display = '';

    setTimeout(function() {
      if (splash && splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 500);

    /* 9. Render default view */
    nav('pos');

    /* 10. Check seed data */
    setTimeout(function() {
      checkSeedData();
    }, 300);

    /* 11. Check low stock */
    setTimeout(function() {
      checkLowStock();
    }, 2000);

  }, 800);

  console.log('[app.js] ready!');
}

/* === RUN ON LOAD === */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

console.log('[app.js] loaded');