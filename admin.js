/* ============================================
   COFFEE POS — ADMIN.JS
   ตั้งค่าร้าน / พนักงาน / Data / About
   ============================================ */

/* === ADMIN VIEW STATE === */
var ADMVIEW = {
  tab: 'shop'   /* 'shop' | 'staff' | 'data' | 'about' */
};

/* ============================================
   RENDER ADMIN VIEW
   ============================================ */
function renderAdminView() {
  var main = $('mainContent');
  if (!main) return;

  var html = '';
  html += '<div class="page-pad anim-fadeUp">';

  /* Header */
  html += '<div class="section-header">';
  html += '<div class="section-title">⚙️ ตั้งค่า</div>';
  html += '</div>';

  /* Sub-tabs */
  html += '<div class="cat-tabs mb-16">';
  html += admSubTab('shop', '🏪 ร้านค้า');
  html += admSubTab('staff', '👥 พนักงาน');
  html += admSubTab('data', '💾 ข้อมูล');
  html += admSubTab('about', 'ℹ️ เกี่ยวกับ');
  html += '</div>';

  /* Content */
  html += '<div id="admContent">';
  html += renderAdmContent();
  html += '</div>';

  html += '</div>';
  main.innerHTML = html;
}

function admSubTab(key, label) {
  var active = ADMVIEW.tab === key ? ' active' : '';
  return '<button class="cat-tab' + active + '" onclick="switchAdmTab(\'' + key + '\')">' + label + '</button>';
}

function switchAdmTab(tab) {
  ADMVIEW.tab = tab;
  vibrate(20);
  renderAdminView();
}

function renderAdmContent() {
  switch (ADMVIEW.tab) {
    case 'shop': return renderShopSettings();
    case 'staff': return renderStaffSettings();
    case 'data': return renderDataSettings();
    case 'about': return renderAboutPage();
    default: return '';
  }
}

/* ============================================
   TAB: SHOP SETTINGS (ตั้งค่าร้าน)
   ============================================ */
function renderShopSettings() {
  var cfg = ST.getConfig();

  var html = '';

  /* Shop Info */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🏪 ข้อมูลร้าน</div></div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ชื่อร้าน</label>';
  html += '<input type="text" id="cfgShopName" value="' + sanitize(cfg.shopName || '') + '" placeholder="Coffee POS">';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">สกุลเงิน</label>';
  html += '<input type="text" id="cfgCurrency" value="' + sanitize(cfg.currency || '฿') + '" placeholder="฿" style="width:80px;">';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">Prefix เลขออเดอร์</label>';
  html += '<input type="text" id="cfgOrderPrefix" value="' + sanitize(cfg.orderPrefix || '#') + '" placeholder="#" style="width:80px;">';
  html += '</div>';

  html += '</div>'; /* end card */

  /* VAT */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">📋 ภาษีและค่าบริการ</div></div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.vatEnabled ? ' on' : '') + '" id="cfgVatEnabled"></div>';
  html += '<span>เปิด VAT</span>';
  html += '</label>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">อัตรา VAT (%)</label>';
  html += '<input type="number" id="cfgVatRate" value="' + (cfg.vatRate || 7) + '" placeholder="7" style="width:100px;" inputmode="numeric">';
  html += '</div>';

  html += '<div style="border-top:1px solid var(--border);margin:16px 0;"></div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.serviceChargeEnabled ? ' on' : '') + '" id="cfgSCEnabled"></div>';
  html += '<span>เปิด Service Charge</span>';
  html += '</label>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">อัตรา Service Charge (%)</label>';
  html += '<input type="number" id="cfgSCRate" value="' + (cfg.serviceChargeRate || 10) + '" placeholder="10" style="width:100px;" inputmode="numeric">';
  html += '</div>';

  html += '</div>'; /* end card */

  /* Receipt */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🧾 ใบเสร็จ</div></div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ขนาดกระดาษ</label>';
  html += '<select id="cfgReceiptWidth">';
  html += '<option value="58mm"' + (cfg.receiptWidth === '58mm' ? ' selected' : '') + '>58mm (Thermal เล็ก)</option>';
  html += '<option value="80mm"' + (cfg.receiptWidth === '80mm' ? ' selected' : '') + '>80mm (Thermal ปกติ)</option>';
  html += '<option value="a4"' + (cfg.receiptWidth === 'a4' ? ' selected' : '') + '>A4 (กระดาษปกติ)</option>';
  html += '</select>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ข้อความท้ายใบเสร็จ</label>';
  html += '<input type="text" id="cfgReceiptFooter" value="' + sanitize(cfg.receiptFooter || '') + '" placeholder="ขอบคุณที่ใช้บริการ">';
  html += '</div>';

  html += '</div>'; /* end card */

  /* Theme */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🎨 ธีม</div></div>';

  html += '<div class="theme-selector">';
  html += '<div class="theme-option' + (cfg.theme === 'dark' ? ' active' : '') + '" onclick="setThemeFromAdmin(\'dark\')">';
  html += '<div class="theme-preview dark-preview"></div>';
  html += '<div class="fw-600">🌙 Dark</div>';
  html += '</div>';
  html += '<div class="theme-option' + (cfg.theme === 'light' ? ' active' : '') + '" onclick="setThemeFromAdmin(\'light\')">';
  html += '<div class="theme-preview light-preview"></div>';
  html += '<div class="fw-600">☀️ Light</div>';
  html += '</div>';
  html += '</div>';

  html += '</div>'; /* end card */

  /* Save */
  html += '<button class="btn btn-primary btn-lg btn-block" onclick="saveShopSettings()">💾 บันทึกการตั้งค่า</button>';

  return html;
}

function saveShopSettings() {
  var cfg = ST.getConfig();

  cfg.shopName = ($('cfgShopName') || {}).value || 'Coffee POS';
  cfg.currency = ($('cfgCurrency') || {}).value || '฿';
  cfg.orderPrefix = ($('cfgOrderPrefix') || {}).value || '#';
  cfg.vatEnabled = hasClass($('cfgVatEnabled'), 'on');
  cfg.vatRate = parseFloat(($('cfgVatRate') || {}).value) || 7;
  cfg.serviceChargeEnabled = hasClass($('cfgSCEnabled'), 'on');
  cfg.serviceChargeRate = parseFloat(($('cfgSCRate') || {}).value) || 10;
  cfg.receiptWidth = ($('cfgReceiptWidth') || {}).value || '80mm';
  cfg.receiptFooter = ($('cfgReceiptFooter') || {}).value || 'ขอบคุณที่ใช้บริการ';

  ST.saveConfig(cfg);
  applyShopName();
  toast('บันทึกการตั้งค่าแล้ว', 'success');
}

function setThemeFromAdmin(theme) {
  var cfg = ST.getConfig();
  cfg.theme = theme;
  ST.saveConfig(cfg);
  document.documentElement.setAttribute('data-theme', theme);
  setText('themeIcon', theme === 'dark' ? '🌙' : '☀️');

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f0f1a' : '#f5f5f5');

  renderAdminView();
  toast(theme === 'dark' ? 'Dark Mode' : 'Light Mode', 'info', 1200);
}

/* ============================================
   TAB: STAFF (พนักงาน)
   ============================================ */
function renderStaffSettings() {
  var staffList = ST.getStaff();
  var shifts = ST.getShifts();

  var html = '';

  /* Header */
  html += '<div class="flex-between mb-16">';
  html += '<div class="text-muted">พนักงานทั้งหมด ' + staffList.length + ' คน</div>';
  html += '<button class="btn btn-primary btn-sm" onclick="modalEditStaff(null)">➕ เพิ่มพนักงาน</button>';
  html += '</div>';

  if (staffList.length === 0) {
    html += '<div class="card p-20 text-center mb-16">';
    html += '<div style="font-size:48px;margin-bottom:12px;">👥</div>';
    html += '<div class="fw-600 mb-8">ยังไม่มีพนักงาน</div>';
    html += '<div class="text-muted fs-sm mb-16">เพิ่มพนักงานเพื่อบันทึกยอดขายแต่ละคน</div>';
    html += '<button class="btn btn-primary" onclick="modalEditStaff(null)">➕ เพิ่มพนักงาน</button>';
    html += '</div>';
  } else {
    /* Staff cards */
    html += '<div class="staff-grid stagger">';
    for (var i = 0; i < staffList.length; i++) {
      html += renderStaffCard(staffList[i], shifts);
    }
    html += '</div>';
  }

  /* Active staff (current session) */
  html += '<div class="card mt-16">';
  html += '<div class="card-header"><div class="card-title">👤 พนักงานปัจจุบัน</div></div>';
  if (APP.currentStaff) {
    html += '<div class="flex-between p-16">';
    html += '<div>';
    html += '<div class="fw-700 fs-lg">' + sanitize(APP.currentStaff.name) + '</div>';
    html += '<div class="text-muted fs-sm">' + getRoleName(APP.currentStaff.role) + '</div>';
    html += '</div>';
    html += '<button class="btn btn-warning btn-sm" onclick="logoutStaff()">🚪 ออกจากระบบ</button>';
    html += '</div>';
  } else {
    html += '<div class="p-16 text-center">';
    html += '<div class="text-muted mb-12">ยังไม่ได้เข้าสู่ระบบพนักงาน</div>';
    html += '<button class="btn btn-primary" onclick="showPinLogin()">🔐 เข้าสู่ระบบ (PIN)</button>';
    html += '</div>';
  }
  html += '</div>';

  /* Today shifts */
  var todayShifts = getTodayShifts(shifts, staffList);
  if (todayShifts.length > 0) {
    html += '<div class="card mt-16">';
    html += '<div class="card-header"><div class="card-title">📋 กะวันนี้</div></div>';
    html += '<div class="table-wrap">';
    html += '<table>';
    html += '<thead><tr><th>พนักงาน</th><th>เข้า</th><th>ออก</th><th>ชั่วโมง</th></tr></thead>';
    html += '<tbody>';
    for (var t = 0; t < todayShifts.length; t++) {
      var sh = todayShifts[t];
      var hrs = calcShiftHours(sh);
      html += '<tr>';
      html += '<td class="fw-600">' + sanitize(sh.staffName) + '</td>';
      html += '<td>' + sanitize(sh.clockIn) + '</td>';
      html += '<td>' + (sh.clockOut ? sanitize(sh.clockOut) : '<span class="badge badge-success">กำลังทำงาน</span>') + '</td>';
      html += '<td>' + (hrs ? hrs + ' ชม.' : '-') + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    html += '</div>';
    html += '</div>';
  }

  return html;
}

function renderStaffCard(staff, allShifts) {
  var isActive = staff.active !== false;
  var activeShift = ST.getActiveShift(staff.id);

  /* Count today orders */
  var todayOrders = ST.getTodayOrders();
  var staffOrders = 0;
  var staffSales = 0;
  for (var i = 0; i < todayOrders.length; i++) {
    if (todayOrders[i].staffId === staff.id && todayOrders[i].status !== 'cancelled') {
      staffOrders++;
      staffSales += todayOrders[i].total || 0;
    }
  }

  var html = '';
  html += '<div class="staff-card anim-fadeUp' + (isActive ? '' : ' inactive') + '">';

  /* Top */
  html += '<div class="flex-between mb-8">';
  html += '<div class="flex gap-8" style="align-items:center;">';
  html += '<div class="staff-avatar">' + getInitials(staff.name) + '</div>';
  html += '<div>';
  html += '<div class="fw-700">' + sanitize(staff.name) + '</div>';
  html += '<div class="text-muted fs-sm">' + getRoleName(staff.role) + '</div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="flex gap-4" style="align-items:center;">';
  if (activeShift) {
    html += '<span class="badge badge-success">🟢 ทำงาน</span>';
  }
  if (!isActive) {
    html += '<span class="badge badge-danger">ปิด</span>';
  }
  html += '</div>';
  html += '</div>';

  /* Today stats */
  if (staffOrders > 0) {
    html += '<div class="flex gap-12 mb-8">';
    html += '<div class="fs-sm"><span class="text-muted">วันนี้:</span> <span class="fw-600">' + staffOrders + ' ออเดอร์</span></div>';
    html += '<div class="fs-sm"><span class="text-muted">ยอดขาย:</span> <span class="fw-700 text-accent">' + formatMoneySign(staffSales) + '</span></div>';
    html += '</div>';
  }

  /* Actions */
  html += '<div class="flex gap-6 mt-8" style="border-top:1px solid var(--border);padding-top:8px;">';
  html += '<button class="btn btn-secondary btn-sm" onclick="modalEditStaff(findById(ST.getStaff(),\'' + sanitize(staff.id) + '\'))">✏️ แก้ไข</button>';

  if (isActive) {
    if (activeShift) {
      html += '<button class="btn btn-warning btn-sm" onclick="doClockOut(\'' + sanitize(staff.id) + '\',\'' + sanitize(activeShift.id) + '\')">🕐 Clock Out</button>';
    } else {
      html += '<button class="btn btn-success btn-sm" onclick="doClockIn(\'' + sanitize(staff.id) + '\')">🕐 Clock In</button>';
    }
  }
  html += '</div>';

  html += '</div>';
  return html;
}

function getInitials(name) {
  if (!name) return '?';
  var parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0].charAt(0) + parts[1].charAt(0);
  return name.charAt(0);
}

function getRoleName(role) {
  var map = { cashier: 'แคชเชียร์', barista: 'บาริสต้า', manager: 'ผู้จัดการ' };
  return map[role] || role || 'พนักงาน';
}

function getTodayShifts(shifts, staffList) {
  var today = todayStr();
  var result = [];
  for (var i = 0; i < shifts.length; i++) {
    if (shifts[i].date === today) {
      var s = cloneObj(shifts[i]);
      var staff = findById(staffList, s.staffId);
      s.staffName = staff ? staff.name : 'ไม่ระบุ';
      result.push(s);
    }
  }
  return result;
}

function calcShiftHours(shift) {
  if (!shift.clockIn) return '';
  var end = shift.clockOut || nowTimeStr();
  var inParts = shift.clockIn.split(':');
  var outParts = end.split(':');
  var inMin = parseInt(inParts[0], 10) * 60 + parseInt(inParts[1], 10);
  var outMin = parseInt(outParts[0], 10) * 60 + parseInt(outParts[1], 10);
  var diff = outMin - inMin;
  if (diff < 0) diff += 1440;
  return roundTo(diff / 60, 1);
}

/* Clock In / Out */
function doClockIn(staffId) {
  ST.clockIn(staffId);
  var staff = findById(ST.getStaff(), staffId);
  toast((staff ? staff.name : '') + ' Clock In แล้ว', 'success');
  renderAdminView();
}

function doClockOut(staffId, shiftId) {
  ST.clockOut(shiftId);
  var staff = findById(ST.getStaff(), staffId);
  toast((staff ? staff.name : '') + ' Clock Out แล้ว', 'info');
  renderAdminView();
}

/* ============================================
   PIN LOGIN
   ============================================ */
function showPinLogin() {
  var html = '';
  html += '<div class="text-center mb-16">';
  html += '<div style="font-size:48px;margin-bottom:8px;">🔐</div>';
  html += '<div class="text-muted">กรอก PIN 4 หลัก</div>';
  html += '</div>';

  html += '<div class="pin-display" id="pinDisplay">';
  html += '<span class="pin-dot"></span>';
  html += '<span class="pin-dot"></span>';
  html += '<span class="pin-dot"></span>';
  html += '<span class="pin-dot"></span>';
  html += '</div>';

  html += '<div id="pinError" class="text-danger text-center fs-sm mb-8" style="min-height:20px;"></div>';

  /* PIN Pad */
  html += '<div class="pin-pad">';
  for (var n = 1; n <= 9; n++) {
    html += '<button class="pin-key" onclick="pinInput(' + n + ')">' + n + '</button>';
  }
  html += '<button class="pin-key" onclick="pinClear()">⌫</button>';
  html += '<button class="pin-key" onclick="pinInput(0)">0</button>';
  html += '<button class="pin-key pin-key-enter" onclick="pinSubmit()">✓</button>';
  html += '</div>';

  html += '<input type="hidden" id="pinValue" value="">';

  var footer = '<button class="btn btn-secondary" onclick="closeMForce()">ยกเลิก</button>';

  openModal('🔐 เข้าสู่ระบบพนักงาน', html, footer);
}

function pinInput(num) {
  var el = $('pinValue');
  if (!el) return;
  var val = el.value;
  if (val.length >= 4) return;
  val += num;
  el.value = val;
  updatePinDots(val.length);
  vibrate(20);

  /* Auto submit at 4 digits */
  if (val.length === 4) {
    setTimeout(function() { pinSubmit(); }, 200);
  }
}

function pinClear() {
  var el = $('pinValue');
  if (!el) return;
  var val = el.value;
  if (val.length > 0) {
    el.value = val.substring(0, val.length - 1);
    updatePinDots(el.value.length);
  }
  setText('pinError', '');
  vibrate(20);
}

function updatePinDots(filled) {
  var dots = qsa('.pin-dot');
  for (var i = 0; i < dots.length; i++) {
    if (i < filled) {
      addClass(dots[i], 'filled');
    } else {
      removeClass(dots[i], 'filled');
    }
  }
}

function pinSubmit() {
  var el = $('pinValue');
  if (!el) return;
  var pin = el.value;
  if (pin.length !== 4) {
    setText('pinError', 'กรุณากรอก PIN 4 หลัก');
    return;
  }

  var staff = ST.verifyPin(pin);
  if (staff) {
    APP.currentStaff = staff;
    setText('topStaff', '👤 ' + staff.name);
    closeMForce();
    toast('ยินดีต้อนรับ ' + staff.name, 'success');

    /* Auto clock in if no active shift */
    var activeShift = ST.getActiveShift(staff.id);
    if (!activeShift) {
      ST.clockIn(staff.id);
      toast(staff.name + ' Clock In แล้ว', 'info', 2000);
    }

    if (APP.currentView === 'admin') renderAdminView();
  } else {
    setText('pinError', '❌ PIN ไม่ถูกต้อง');
    el.value = '';
    updatePinDots(0);
    vibrate(100);
  }
}

function logoutStaff() {
  if (!APP.currentStaff) return;
  confirmDialog('ออกจากระบบ ' + APP.currentStaff.name + '?', function() {
    /* Clock out if active */
    var activeShift = ST.getActiveShift(APP.currentStaff.id);
    if (activeShift) {
      ST.clockOut(activeShift.id);
    }

    var name = APP.currentStaff.name;
    APP.currentStaff = null;
    setText('topStaff', '');
    toast(name + ' ออกจากระบบแล้ว', 'info');
    if (APP.currentView === 'admin') renderAdminView();
  });
}

/* ============================================
   TAB: DATA MANAGEMENT
   ============================================ */
function renderDataSettings() {
  var info = ST.getStorageInfo();

  var html = '';

  /* Storage info */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">💾 พื้นที่จัดเก็บ</div></div>';

  html += '<div class="flex-between mb-12">';
  html += '<span class="text-muted">ใช้พื้นที่ทั้งหมด</span>';
  html += '<span class="fw-700">' + info.totalFormatted + '</span>';
  html += '</div>';

  /* Detail per key */
  html += '<div class="storage-bars">';
  var keys = ST._keys;
  var barColors = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
  for (var i = 0; i < keys.length; i++) {
    var size = info.details[keys[i]] || 0;
    if (size === 0) continue;
    var pctW = info.total > 0 ? (size / info.total) * 100 : 0;
    html += '<div class="storage-bar-row">';
    html += '<div class="flex-between fs-sm">';
    html += '<span class="fw-600">' + keys[i] + '</span>';
    html += '<span class="text-muted">' + formatSize(size) + '</span>';
    html += '</div>';
    html += '<div class="stock-bar mt-4">';
    html += '<div class="stock-bar-fill" style="width:' + Math.max(2, pctW) + '%;background:' + barColors[i % barColors.length] + ';"></div>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  html += '</div>';

  /* Export / Import */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">📤 Export / Import</div></div>';

  html += '<div class="admin-actions">';

  html += '<div class="admin-action-card" onclick="exportJSON()">';
  html += '<div class="admin-action-icon">📥</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600">Backup JSON</div>';
  html += '<div class="text-muted fs-sm">ดาวน์โหลดข้อมูลทั้งหมดเป็น JSON</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="admin-action-card" onclick="importJSONTrigger()">';
  html += '<div class="admin-action-icon">📤</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600">Restore JSON</div>';
  html += '<div class="text-muted fs-sm">นำเข้าข้อมูลจากไฟล์ JSON</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="admin-action-card" onclick="exportCSVOrders()">';
  html += '<div class="admin-action-icon">📊</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600">Export ยอดขาย CSV</div>';
  html += '<div class="text-muted fs-sm">ออเดอร์ทั้งหมดเป็น CSV สำหรับ Excel</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="admin-action-card" onclick="exportCSVMenu()">';
  html += '<div class="admin-action-icon">📋</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600">Export เมนู CSV</div>';
  html += '<div class="text-muted fs-sm">รายการเมนูทั้งหมดเป็น CSV</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="admin-action-card" onclick="copySalesReport()">';
  html += '<div class="admin-action-icon">📝</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600">Copy สรุปยอดวันนี้</div>';
  html += '<div class="text-muted fs-sm">คัดลอกเพื่อวางใน Line / Sheets</div>';
  html += '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';

  /* Hidden file input */
  html += '<input type="file" id="importFileInput" accept=".json" style="display:none;" onchange="importJSONFile(this)">';

  /* Danger Zone */
  html += '<div class="card mb-16" style="border-color:var(--danger);">';
  html += '<div class="card-header"><div class="card-title text-danger">⚠️ Danger Zone</div></div>';

  html += '<div class="admin-actions">';

  html += '<div class="admin-action-card danger" onclick="clearAllOrders()">';
  html += '<div class="admin-action-icon">🗑</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600 text-danger">ล้างออเดอร์ทั้งหมด</div>';
  html += '<div class="text-muted fs-sm">ลบออเดอร์ทั้งหมด (เมนูยังอยู่)</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="admin-action-card danger" onclick="resetAllData()">';
  html += '<div class="admin-action-icon">💣</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600 text-danger">Reset ข้อมูลทั้งหมด</div>';
  html += '<div class="text-muted fs-sm">ลบทุกอย่าง กลับสู่สถานะเริ่มต้น</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="admin-action-card" onclick="loadSampleData()">';
  html += '<div class="admin-action-icon">🧪</div>';
  html += '<div class="admin-action-info">';
  html += '<div class="fw-600">โหลดข้อมูลตัวอย่าง</div>';
  html += '<div class="text-muted fs-sm">เพิ่มเมนูตัวอย่าง 15 รายการ</div>';
  html += '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';

  return html;
}

/* Data actions */
function clearAllOrders() {
  var orders = ST.getOrders();
  confirmDialog('ล้างออเดอร์ทั้งหมด ' + orders.length + ' รายการ?\n\nคำเตือน: ไม่สามารถกู้คืนได้!', function() {
    ST.saveOrders([]);
    toast('ล้างออเดอร์ทั้งหมดแล้ว', 'warning');
    renderAdminView();
  });
}

function resetAllData() {
  confirmDialog('⚠️ Reset ข้อมูลทั้งหมด?\n\nจะลบ: เมนู, ออเดอร์, Stock, พนักงาน, การตั้งค่า\n\nไม่สามารถกู้คืนได้!', function() {
    ST.clearAll();
    APP.currentStaff = null;
    setText('topStaff', '');
    applyShopName();
    toast('Reset ข้อมูลทั้งหมดแล้ว', 'warning');
    nav('pos');
  });
}

function loadSampleData() {
  confirmDialog('เพิ่มเมนูตัวอย่าง? (ข้อมูลเดิมจะไม่ถูกลบ)', function() {
    ST.seedSampleData();
    renderAdminView();
  });
}

/* Import trigger */
function importJSONTrigger() {
  var input = $('importFileInput');
  if (input) input.click();
}

function importJSONFile(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      confirmDialog('นำเข้าข้อมูลจาก ' + file.name + '?\n\nข้อมูลเดิมจะถูกแทนที่', function() {
        ST.importAll(data);
        applyShopName();
        applyTheme();
        renderAdminView();
      });
    } catch (err) {
      toast('ไฟล์ JSON ไม่ถูกต้อง', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

/* ============================================
   TAB: ABOUT
   ============================================ */
function renderAboutPage() {
  var html = '';

  html += '<div class="card text-center p-20 mb-16">';
  html += '<div style="font-size:64px;margin-bottom:12px;">☕</div>';
  html += '<div class="fw-800 fs-xl mb-4">Coffee POS</div>';
  html += '<div class="text-muted mb-8">v1.0.0</div>';
  html += '<div class="text-muted fs-sm">ระบบ POS สำหรับร้านกาแฟ</div>';
  html += '<div class="text-muted fs-sm">ใช้งานบน iPad / มือถือ / PC</div>';
  html += '</div>';

  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">📱 เทคโนโลยี</div></div>';
  html += '<div class="about-tech">';
  html += aboutRow('Frontend', 'HTML + CSS + JavaScript (ES5)');
  html += aboutRow('Storage', 'localStorage + Firebase Firestore');
  html += aboutRow('Auth', 'Google Auth + PIN Login');
  html += aboutRow('Hosting', 'GitHub Pages');
  html += aboutRow('PWA', 'Service Worker + Offline');
  html += aboutRow('Theme', 'Dark / Light Mode');
  html += '</div>';
  html += '</div>';

  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">⌨️ Keyboard Shortcuts</div></div>';
  html += '<div class="about-tech">';
  html += aboutRow('F1', 'ไปหน้า POS');
  html += aboutRow('F2', 'ไปหน้า Orders');
  html += aboutRow('F3', 'ไปหน้า Report');
  html += aboutRow('Esc', 'ปิด Modal');
  html += aboutRow('Ctrl+P', 'พิมพ์ใบเสร็จ');
  html += '</div>';
  html += '</div>';

  html += '<div class="card">';
  html += '<div class="card-header"><div class="card-title">🔗 Cloud Sync</div></div>';
  if (typeof _fbUser !== 'undefined' && _fbUser) {
    html += '<div class="p-16">';
    html += '<div class="flex gap-8" style="align-items:center;">';
    html += '<span class="badge badge-success">🟢 Connected</span>';
    html += '<span class="fw-600">' + sanitize(_fbUser.email || _fbUser.displayName || '') + '</span>';
    html += '</div>';
    html += '</div>';
  } else {
    html += '<div class="p-16 text-center">';
    html += '<div class="text-muted mb-12">ยังไม่ได้เชื่อมต่อ Firebase</div>';
    html += '<button class="btn btn-primary" onclick="handleAuth()">🔐 Login with Google</button>';
    html += '</div>';
  }
  html += '</div>';

  return html;
}

function aboutRow(label, value) {
  return '<div class="about-row"><span class="fw-600">' + sanitize(label) + '</span><span class="text-muted">' + sanitize(value) + '</span></div>';
}

/* ============================================
   ADDITIONAL CSS (inject once)
   ============================================ */
(function() {
  var styleId = 'adminViewStyle';
  if (document.getElementById(styleId)) return;

  var css = '';

  /* Theme selector */
  css += '.theme-selector{display:flex;gap:12px;padding:8px 0;}';
  css += '.theme-option{flex:1;padding:12px;border:2px solid var(--border);border-radius:var(--radius);cursor:pointer;text-align:center;transition:all var(--transition);}';
  css += '.theme-option:hover{border-color:var(--accent);}';
  css += '.theme-option.active{border-color:var(--accent);background:rgba(249,115,22,0.08);}';
  css += '.theme-preview{height:40px;border-radius:var(--radius-sm);margin-bottom:8px;}';
  css += '.dark-preview{background:linear-gradient(135deg,#0f0f1a,#1a1a2e);}';
  css += '.light-preview{background:linear-gradient(135deg,#f5f5f5,#ffffff);border:1px solid #ddd;}';

  /* Admin actions */
  css += '.admin-actions{display:flex;flex-direction:column;gap:8px;}';
  css += '.admin-action-card{display:flex;align-items:center;gap:16px;padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all var(--transition);}';
  css += '.admin-action-card:hover{border-color:var(--accent);background:var(--glass);}';
  css += '.admin-action-card.danger:hover{border-color:var(--danger);background:rgba(239,68,68,0.05);}';
  css += '.admin-action-icon{font-size:28px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}';
  css += '.admin-action-info{flex:1;min-width:0;}';

  /* Storage bars */
  css += '.storage-bars{display:flex;flex-direction:column;gap:10px;}';
  css += '.storage-bar-row{padding:4px 0;}';

  /* Staff grid */
  css += '.staff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;}';
  css += '.staff-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:all var(--transition);}';
  css += '.staff-card:hover{border-color:var(--accent);box-shadow:var(--shadow);}';
  css += '.staff-card.inactive{opacity:0.5;}';
  css += '.staff-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));';
  css += 'display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0;}';

  /* PIN Pad */
  css += '.pin-display{display:flex;justify-content:center;gap:16px;margin-bottom:16px;}';
  css += '.pin-dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--border);transition:all var(--transition);}';
  css += '.pin-dot.filled{background:var(--accent);border-color:var(--accent);}';
  css += '.pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:260px;margin:0 auto;}';
  css += '.pin-key{height:56px;font-size:24px;font-weight:700;border-radius:var(--radius-sm);';
  css += 'background:var(--bg-card);border:1px solid var(--border);transition:all var(--transition);display:flex;align-items:center;justify-content:center;}';
  css += '.pin-key:hover{border-color:var(--accent);background:var(--glass);}';
  css += '.pin-key:active{transform:scale(0.92);background:var(--accent);color:#fff;}';
  css += '.pin-key-enter{background:var(--success);color:#fff;border-color:var(--success);}';
  css += '.pin-key-enter:hover{opacity:0.9;}';

  /* About */
  css += '.about-tech{display:flex;flex-direction:column;gap:0;}';
  css += '.about-row{display:flex;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border);}';
  css += '.about-row:last-child{border-bottom:none;}';

  /* Mobile */
  css += '@media(max-width:768px){';
  css += '.staff-grid{grid-template-columns:1fr;}';
  css += '.theme-selector{flex-direction:row;}';
  css += '}';

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
})();

console.log('[admin.js] loaded');