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
  /* ตรวจสอบสิทธิ์พนักงาน */
  if (APP.currentStaff) {
    if (!ST.canAccessView(APP.currentStaff, view)) {
      /* ถ้าเป็น manager แม้แต่ role ไม่ใช่ manager แต่ PIN ถูกต้อง? ให้ใส่ PIN */
      verifyManagerPIN(view);
      return;
    }
  }
  
  var validViews = ['pos', 'menu', 'orders', 'report', 'stock', 'staff', 'members', 'recipe', 'admin'];
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

/* ============================================
   RENDER STAFF VIEW (Standalone page)
   ============================================ */
function renderStaffView() {
  var main = $('mainContent');
  if (!main) return;
  
  /* Check if renderStaffSettings exists (from admin.js) */
  if (typeof renderStaffSettings !== 'function') {
    main.innerHTML = '<div class="page-pad text-center"><div class="empty-state">❌ ไม่สามารถโหลดหน้าพนักงานได้</div></div>';
    return;
  }
  
  var html = '<div class="page-pad anim-fadeUp">';
  html += '<div class="section-header">';
  html += '<div class="section-title">👥 จัดการพนักงาน</div>';
  html += '</div>';
  html += renderStaffSettings();
  html += '</div>';
  
  main.innerHTML = html;
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
    case 'staff':
      if (typeof renderStaffView === 'function') renderStaffView();
      break;
    case 'members':
      if (typeof renderMembersView === 'function') renderMembersView();
      break;
    case 'recipe':
      if (typeof renderRecipeView === 'function') renderRecipeView();
      break;
    case 'admin':
      if (typeof renderAdminView === 'function') renderAdminView();
      break;
    default:
      main.innerHTML = '<div class="empty-state"><div class="empty-icon">🚧</div><div class="empty-text">Coming soon...</div></div>';
  }
}
/* ============================================
   MANAGER PIN OVERRIDE
   ============================================ */
var _pendingView = null;

function verifyManagerPIN(view) {
  _pendingView = view;
  
  var html = '';
  html += '<div class="text-center mb-16">';
  html += '<div style="font-size:48px;margin-bottom:8px;">👑</div>';
  html += '<div class="fw-700 fs-lg mb-4">สิทธิ์ผู้จัดการ</div>';
  html += '<div class="text-muted fs-sm mb-8">กรุณาใส่ PIN ผู้จัดการ เพื่อเข้าถึงหน้านี้</div>';
  html += '</div>';
  
  html += '<div class="form-group">';
  html += '<label class="form-label">PIN ผู้จัดการ</label>';
  html += '<input type="password" id="managerPin" placeholder="****" maxlength="4" inputmode="numeric" style="font-size:24px;text-align:center;letter-spacing:8px;">';
  html += '</div>';
  
  var footer = '';
  footer += '<button class="btn btn-secondary" onclick="closeMForce()">ยกเลิก</button>';
  footer += '<button class="btn btn-primary" onclick="submitManagerPIN()">ยืนยัน</button>';
  
  openModal('🔐 ยืนยันสิทธิ์', html, footer);
}

function submitManagerPIN() {
  var pin = ($('managerPin') || {}).value;
  if (!pin || pin.length !== 4) {
    toast('กรุณาใส่ PIN 4 หลัก', 'error');
    return;
  }
  
  /* หา manager ที่มี PIN นี้ */
  var staffList = ST.getStaff();
  var manager = null;
  for (var i = 0; i < staffList.length; i++) {
    if (staffList[i].pin === pin && staffList[i].role === 'manager') {
      manager = staffList[i];
      break;
    }
  }
  
  if (manager) {
    closeMForce();
    if (_pendingView) {
      nav(_pendingView);
    }
    _pendingView = null;
    toast('ยืนยันสิทธิ์สำเร็จ', 'success');
  } else {
    toast('PIN ผู้จัดการไม่ถูกต้อง', 'error');
  }
}

/* ============================================
   SIDEBAR
   ============================================ */
function toggleSidebar() {
  var sidebar = $('sidebar');
  var overlay = $('sidebarOverlay');
  var mainContent = $('mainContent');
  if (!sidebar) return;

  /* สำหรับ Desktop: ถ้าไม่ใช่ mobile ให้ toggle class hidden */
  if (!APP.isMobile) {
    if (hasClass(sidebar, 'hidden')) {
      removeClass(sidebar, 'hidden');
      if (mainContent) removeClass(mainContent, 'sidebar-hidden');
      localStorage.setItem('sidebarHidden', 'false');
    } else {
      addClass(sidebar, 'hidden');
      if (mainContent) addClass(mainContent, 'sidebar-hidden');
      localStorage.setItem('sidebarHidden', 'true');
    }
  } else {
    /* Mobile: ใช้ slide open/close */
    if (hasClass(sidebar, 'open')) {
      closeSidebar();
    } else {
      addClass(sidebar, 'open');
      addClass(overlay, 'show');
    }
  }
  vibrate(20);
}

function closeSidebar() {
  removeClass('sidebar', 'open');
  removeClass('sidebarOverlay', 'show');
}

/* Load saved sidebar state on desktop */
function loadSidebarState() {
  if (APP.isMobile) return;
  
  var isHidden = localStorage.getItem('sidebarHidden') === 'true';
  var sidebar = $('sidebar');
  var mainContent = $('mainContent');
  
  if (!sidebar) return;
  
  if (isHidden) {
    addClass(sidebar, 'hidden');
    if (mainContent) addClass(mainContent, 'sidebar-hidden');
  } else {
    removeClass(sidebar, 'hidden');
    if (mainContent) removeClass(mainContent, 'sidebar-hidden');
  }
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
   [Standard Version] FEATURE TOGGLE
   ============================================ */
function applyFeatureToggle() {
  if (typeof FeatureManager === 'undefined' || !FeatureManager.isEnabled) {
    console.log('[FeatureToggle] FeatureManager not ready yet');
    return;
  }
  
  var cfg = ST.getConfig();

  /* Sidebar */
  var sideItems = qsa('.nav-item');
  for (var i = 0; i < sideItems.length; i++) {
    var view = sideItems[i].getAttribute('data-view');
    var show = FeatureManager.isViewEnabled(view);
    sideItems[i].style.display = show ? '' : 'none';
  }

  /* Bottom Nav */
  var bnavItems = qsa('.bnav-item');
  for (var j = 0; j < bnavItems.length; j++) {
    var bview = bnavItems[j].getAttribute('data-view');
    var bshow = FeatureManager.isViewEnabled(bview);
    bnavItems[j].style.display = bshow ? '' : 'none';
  }
  
  /* Update sidebar visibility for members/recipe */
  if (typeof updateSidebarVisibility === 'function') {
    updateSidebarVisibility();
  }
}
/* อัปเดต Sidebar ตามสิทธิ์พนักงาน */
function updateSidebarByStaffPermission() {
  console.log('[updateSidebarByStaffPermission] Called, currentStaff:', APP.currentStaff);
  
  var sideItems = qsa('.nav-item');
  var recentStrip = $('#recentStrip');
  var holdStrip = $('#holdOrdersStrip');
  
  /* ถ้าไม่มี staff login → ซ่อนทุกอย่าง */
  if (!APP.currentStaff) {
    /* ซ่อน sidebar ทั้งหมด */
    for (var i = 0; i < sideItems.length; i++) {
      sideItems[i].style.display = 'none';
    }
    
    /* ซ่อน recent orders และ hold orders */
    if (recentStrip) recentStrip.style.display = 'none';
    if (holdStrip) holdStrip.style.display = 'none';
    
    /* ซ่อนปุ่ม Logout แสดงปุ่ม Login */
    var loginBtn = $('#loginBtn');
    var logoutBtn = $('#logoutBtn');
    if (loginBtn) loginBtn.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    return;
  }
  
  /* มี staff login → แสดงตามสิทธิ์ */
  for (var i = 0; i < sideItems.length; i++) {
    var view = sideItems[i].getAttribute('data-view');
    var canAccess = false;
    
    if (APP.currentStaff.role === 'manager') {
      canAccess = true;
    } else {
      /* cashier/barista เห็นแค่ POS และ Orders */
      canAccess = (view === 'pos' || view === 'orders');
    }
    
    sideItems[i].style.display = canAccess ? '' : 'none';
  }
  
  /* แสดง recent orders และ hold orders */
  if (recentStrip) recentStrip.style.display = '';
  if (holdStrip) holdStrip.style.display = '';
  
  /* แสดงปุ่ม Logout ซ่อนปุ่ม Login */
  var loginBtn = $('#loginBtn');
  var logoutBtn = $('#logoutBtn');
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = '';
}

/* อัปเดต UI ตามสถานะ Login */
function updateLoginUI() {
  var isLoggedIn = !!APP.currentStaff;
  var loginBtn = $('#loginBtn');
  var logoutBtn = $('#logoutBtn');
  var topStaff = $('#topStaff');
  
  console.log('[updateLoginUI] isLoggedIn:', isLoggedIn);
  
  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = '';
    if (topStaff) {
      topStaff.textContent = '👤 ' + APP.currentStaff.name;
      topStaff.style.display = '';
    }
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (topStaff) {
      topStaff.textContent = '';
      topStaff.style.display = 'none';
    }
  }
}
/* ============================================
   INIT
   ============================================ */
function initApp() {
  console.log('[app.js] initializing...');

  checkMobile();
  applyTheme();
  applyShopName();
  
  /* Apply feature toggles */
  if (typeof FeatureManager !== 'undefined' && FeatureManager.applyToUI) {
    FeatureManager.applyToUI();
  } else {
    applyFeatureToggle();
  }

  startClock();
  registerSW();
  initShortcuts();
  window.addEventListener('resize', debouncedResize);
  
 /* Load sidebar state after DOM ready */
  setTimeout(function() {
    loadSidebarState();
    updateSidebarVisibility(); 
        restoreSession();
    updateSidebarByStaffPermission(); 
        updateLoginUI();
  }, 100);

  /* 1. Check mobile */
  checkMobile();

  /* 2. Apply theme */
  applyTheme();

  /* 3. Apply shop name */
  applyShopName();

  /* 4. Apply feature toggle */
  applyFeatureToggle();

  /* 5. Start clock */
  startClock();

  /* 6. Register Service Worker */
  registerSW();

  /* 7. Init keyboard shortcuts */
  initShortcuts();

  /* 8. Window resize */
  window.addEventListener('resize', debouncedResize);

  /* 9. Hide splash, show app */
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

function showStaffMenu() {
  if (!APP.currentStaff) return;
  
  var html = '';
  html += '<div class="text-center mb-16">';
  html += '<div style="font-size:48px;">👤</div>';
  html += '<div class="fw-800 fs-lg mt-2">' + sanitize(APP.currentStaff.name) + '</div>';
  html += '<div class="text-muted">' + getRoleName(APP.currentStaff.role) + '</div>';
  html += '</div>';
  
  html += '<div class="card-glass p-16 mb-16">';
  html += '<div class="flex-between mb-8">';
  html += '<span>ตำแหน่ง</span>';
  html += '<span>' + getRoleName(APP.currentStaff.role) + '</span>';
  html += '</div>';
  html += '<div class="flex-between">';
  html += '<span>สถานะ</span>';
  html += '<span class="badge badge-success">กำลังทำงาน</span>';
  html += '</div>';
  html += '</div>';
  
  html += '<div class="flex gap-8">';
  html += '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';
  html += '<button class="btn btn-danger" onclick="closeMForce(); logoutStaff()">🚪 ออกจากระบบ</button>';
  html += '</div>';
  
  openModal('👤 บัญชีของฉัน', html);
}
/* ============================================
   RESTORE LOGIN SESSION AFTER REFRESH
   ============================================ */
function restoreSession() {
  var savedSession = ST.getObj('current_session', null);
  
  if (savedSession && savedSession.staffId) {
    var staff = findById(ST.getStaff(), savedSession.staffId);
    
    if (staff && staff.active !== false) {
      APP.currentStaff = staff;
      
      /* อัปเดต UI */
      updateLoginUI();
      updateSidebarByStaffPermission();
      
      console.log('[Session] Restored login for:', staff.name);
      return true;
    } else {
      /* session หมดอายุ หรือ staff ถูกลบ */
      ST.remove('current_session');
    }
  }
  
  return false;
}
/* ============================================
   UPDATE SIDEBAR VISIBILITY (Feature Toggle)
   ============================================ */
function updateSidebarVisibility() {
  if (typeof FeatureManager === 'undefined') return;
  
  var showMembers = FeatureManager.isEnabled('pro_members');
  var showRecipe = FeatureManager.isEnabled('pro_recipe');
  var showMenuImage = FeatureManager.isEnabled('pro_menu_image');
  
  var membersNav = $('#navMembers');
  var recipeNav = $('#navRecipe');
  
  if (membersNav) membersNav.style.display = showMembers ? '' : 'none';
  if (recipeNav) recipeNav.style.display = showRecipe ? '' : 'none';
}
console.log('[app.js] loaded');