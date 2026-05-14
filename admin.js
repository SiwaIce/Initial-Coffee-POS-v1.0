/* ============================================
   COFFEE POS — ADMIN.JS
   ตั้งค่าร้าน / พนักงาน / Data / About
   [Standard Version 1.2]
   ============================================ */

/* === ADMIN VIEW STATE === */
var ADMVIEW = {
  tab: 'shop'
};

/* ============================================
   RENDER ADMIN VIEW
   ============================================ */
function renderAdminView() {
  var main = $('mainContent');
  if (!main) return;

  var html = '';
  html += '<div class="page-pad anim-fadeUp">';

  html += '<div class="section-header">';
  html += '<div class="section-title">⚙️ ตั้งค่า</div>';
  html += '</div>';

  html += '<div class="cat-tabs mb-16">';
  html += admSubTab('shop', '🏪 ร้านค้า');
  html += admSubTab('staff', '👥 พนักงาน');
  html += admSubTab('members', '👤 สมาชิก');
  html += admSubTab('recipe', '🧪 สูตรวัตถุดิบ');  // NEW - Pro feature
  html += admSubTab('data', '💾 ข้อมูล');
  html += admSubTab('license', '🔑 License');
  html += admSubTab('about', 'ℹ️ เกี่ยวกับ');
  html += '</div>';

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
    case 'members':
  setTimeout(function() {
    if (typeof renderMembersView === 'function') {
      renderMembersView();
    }
  }, 50);
  return '<div id="membersViewContainer"></div>';

    case 'recipe': 
      /* Return container, then load recipe view after DOM ready */
      setTimeout(function() {
        if (typeof renderRecipeView === 'function') {
          var container = document.getElementById('recipeViewContainer');
          if (container) {
            renderRecipeView();
          }
        }
      }, 50);
      return renderRecipeAdminTab();
    case 'data': return renderDataSettings();
    case 'license': return renderLicenseTab();
    case 'about': return renderAboutPage();
    default: return '';
  }
}
// เพิ่มฟังก์ชันใหม่
function renderLicenseTab() {
  var licenseTier = LicenseManager ? LicenseManager.getTier() : 'standard';
  var licenseKey = LicenseManager ? LicenseManager.getCurrentKey() : null;
  var daysLeft = LicenseManager ? LicenseManager.getTrialDaysLeft() : 0;
  
  var html = '';
  
  html += '<div class="card mb-16">';
  html += '<div class="card-header">';
  html += '<div class="card-title">🔑 สถานะ License</div>';
  html += '</div>';
  
  html += '<div class="text-center p-16">';
  html += '<div style="font-size:64px;">';
  if (licenseTier === 'pro') html += '⭐';
  else if (licenseTier === 'trial') html += '🧪';
  else html += '📦';
  html += '</div>';
  
  html += '<div class="fw-800 fs-xl mt-4">';
  if (licenseTier === 'pro') html += 'Pro Edition';
  else if (licenseTier === 'trial') html += 'Trial Mode';
  else html += 'Standard Edition (Free)';
  html += '</div>';
  
  if (licenseKey) {
    html += '<div class="text-muted mt-4">Key: <code>' + sanitize(licenseKey) + '</code></div>';
  }
  
  if (licenseTier === 'trial' && daysLeft > 0) {
    html += '<div class="mt-4"><span class="badge badge-warning">เหลือ ' + daysLeft + ' วัน</span></div>';
  }
  
  html += '</div>';
  html += '</div>';
  
  /* Feature comparison table */
  html += '<div class="card mb-16">';
  html += '<div class="card-header">';
  html += '<div class="card-title">📋 เปรียบเทียบฟีเจอร์</div>';
  html += '</div>';
  
  html += '<div class="table-wrap">';
  html += '<table>';
  html += '<thead>';
  html += '<tr><th>ฟีเจอร์</th><th class="text-center">Standard</th><th class="text-center">Pro</th></tr>';
  html += '</thead>';
  html += '<tbody>';
  
  var compareFeatures = [
    { name: '📦 Stock วัตถุดิบ', std: '✅', pro: '✅' },
    { name: '👥 ระบบพนักงาน', std: '✅', pro: '✅' },
    { name: '📷 PromptPay QR', std: '✅', pro: '✅' },
    { name: '💬 LINE Notify', std: '⚠️', pro: '✅' },
    { name: '👤 สมาชิก + แต้ม', std: '❌', pro: '✅' },
    { name: '🧪 Recipe + COGS', std: '❌', pro: '✅' },
    { name: '⚡ Auto ตัด Stock', std: '❌', pro: '✅' },
    { name: '🍳 Kitchen Display', std: '❌', pro: '✅' },
    { name: '🔄 Real-time Dashboard', std: '❌', pro: '✅' },
    { name: '📈 รายงานขั้นสูง', std: '❌', pro: '✅' }
  ];
  
  for (var i = 0; i < compareFeatures.length; i++) {
    var f = compareFeatures[i];
    var stdClass = f.std === '✅' ? 'text-success' : (f.std === '⚠️' ? 'text-warning' : 'text-danger');
    var proClass = f.pro === '✅' ? 'text-success' : 'text-danger';
    
    html += '<tr>';
    html += '<td class="fw-600">' + f.name + '</td>';
    html += '<td class="text-center ' + stdClass + '">' + f.std + '</td>';
    html += '<td class="text-center ' + proClass + '">' + f.pro + '</td>';
    html += '</tr>';
  }
  
  html += '</tbody>';
  html += '</table>';
  html += '</div>';
  html += '</div>';
  
  /* Action buttons */
  html += '<div class="flex gap-12 flex-wrap">';
  if (licenseTier !== 'pro') {
    html += '<button class="btn btn-primary btn-lg" style="flex:1;" onclick="LicenseManager.showLicenseModal()">🔑 เปิดใช้งาน Pro License</button>';
  } else {
    html += '<button class="btn btn-secondary" onclick="LicenseManager.showLicenseModal()">🔄 เปลี่ยน License Key</button>';
  }
  html += '</div>';
  
  return html;
}

/* ============================================
   TAB: SHOP SETTINGS
   ============================================ */
function renderShopSettings() {
  var cfg = ST.getConfig();

  var html = '';

  /* === Shop Info === */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🏪 ข้อมูลร้าน</div></div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ชื่อร้าน</label>';
  html += '<input type="text" id="cfgShopName" value="' + sanitize(cfg.shopName || '') + '" placeholder="Coffee POS">';
  html += '</div>';

  html += '<div class="form-row">';
  html += '<div class="form-group">';
  html += '<label class="form-label">สกุลเงิน</label>';
  html += '<input type="text" id="cfgCurrency" value="' + sanitize(cfg.currency || '฿') + '" placeholder="฿" style="width:80px;">';
  html += '</div>';
  html += '<div class="form-group">';
  html += '<label class="form-label">Prefix ออเดอร์</label>';
  html += '<input type="text" id="cfgOrderPrefix" value="' + sanitize(cfg.orderPrefix || '#') + '" placeholder="#" style="width:80px;">';
  html += '</div>';
  html += '</div>';

  /* Feature Toggle */
  html += '<div style="border-top:1px solid var(--border);margin:14px 0;"></div>';
  html += '<div class="fw-600 mb-8">📌 แสดงเมนู</div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.showStock !== false ? ' on' : '') + '" id="cfgShowStock"></div>';
  html += '<span>📦 Stock วัตถุดิบ</span>';
  html += '</label>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.showStaff !== false ? ' on' : '') + '" id="cfgShowStaff"></div>';
  html += '<span>👥 พนักงาน / PIN Login</span>';
  html += '</label>';
  html += '</div>';

  html += '</div>'; /* end shop info card */

  /* === VAT / SC === */
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

  html += '<div style="border-top:1px solid var(--border);margin:14px 0;"></div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.serviceChargeEnabled ? ' on' : '') + '" id="cfgSCEnabled"></div>';
  html += '<span>เปิด Service Charge</span>';
  html += '</label>';
  html += '</div>';
  html += '<div class="form-group">';
  html += '<label class="form-label">อัตรา SC (%)</label>';
  html += '<input type="number" id="cfgSCRate" value="' + (cfg.serviceChargeRate || 10) + '" placeholder="10" style="width:100px;" inputmode="numeric">';
  html += '</div>';

  html += '</div>'; /* end VAT card */

  /* === Sound === */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🔊 เสียง</div></div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.soundEnabled !== false ? ' on' : '') + '" id="cfgSoundEnabled"></div>';
  html += '<span>เปิดเสียงเตือน</span>';
  html += '</label>';
  html += '</div>';

  html += '<div class="flex gap-8">';
  html += '<button class="btn btn-secondary btn-sm" onclick="if(typeof playSound===\'function\')playSound(\'add\')">🔔 ทดสอบ สั่ง</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="if(typeof playSound===\'function\')playSound(\'success\')">🎵 ทดสอบ สำเร็จ</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="if(typeof playSound===\'function\')playSound(\'error\')">⚠️ ทดสอบ Error</button>';
  html += '</div>';

  html += '</div>'; /* end Sound card */

/* === [Pro] PromptPay Multiple Accounts === */
  ST.migratePromptPay();
  var ppAccounts = ST.getPromptPayAccounts();

  html += '<div class="card mb-16">';
  html += '<div class="card-header">';
  html += '<div class="card-title">📱 QR PromptPay</div>';
  html += '<button class="btn btn-primary btn-sm" onclick="modalEditPromptPay(null)">➕ เพิ่มบัญชี</button>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.promptPayEnabled ? ' on' : '') + '" id="cfgPPEnabled"></div>';
  html += '<span>เปิดใช้ QR PromptPay</span>';
  html += '</label>';
  html += '</div>';

  if (ppAccounts.length === 0) {
    html += '<div class="text-muted text-center p-16">ยังไม่มีบัญชี — กด "เพิ่มบัญชี"</div>';
  } else {
    html += '<div class="admin-actions">';
    for (var pp = 0; pp < ppAccounts.length; pp++) {
      var ppa = ppAccounts[pp];
      html += '<div class="admin-action-card" style="padding:10px 14px;" onclick="modalEditPromptPay(findById(ST.getPromptPayAccounts(),\'' + sanitize(ppa.id) + '\'))">';
      html += '<div class="flex gap-8" style="align-items:center;flex:1;">';
      html += '<span style="font-size:20px;">📱</span>';
      html += '<div>';
      html += '<div class="fw-600">' + sanitize(ppa.name || 'ไม่มีชื่อ') + '</div>';
      if (typeof formatPromptPayId === 'function') {
        html += '<div class="text-muted fs-sm">' + formatPromptPayId(ppa.ppId) + '</div>';
      }
      html += '</div>';
      html += '</div>';
      html += '<div class="flex gap-6" style="align-items:center;">';
      if (ppa.isDefault) {
        html += '<span class="badge badge-success">ค่าเริ่มต้น</span>';
      } else {
        html += '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); setDefaultPP(\'' + sanitize(ppa.id) + '\')">ตั้งเป็นหลัก</button>';
      }
      html += '<span class="text-muted">✏️</span>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    /* Preview default QR */
    var defPP = ST.getDefaultPromptPay();
    if (defPP && typeof getPromptPayQRUrl === 'function') {
      html += '<div class="text-center mt-8">';
      html += '<div class="text-muted fs-sm mb-4">QR บัญชีหลัก (฿100)</div>';
      html += '<div class="qr-frame" style="display:inline-block;">';
      html += '<img src="' + getPromptPayQRUrl(defPP.ppId, 100, 150) + '" style="width:150px;height:150px;border-radius:8px;">';
      html += '</div>';
      html += '</div>';
    }
  }

  html += '</div>'; /* end PromptPay card */

  /* === Sales Channels === */
  html += '<div class="card mb-16">';
  html += '<div class="card-header">';
  html += '<div class="card-title">🛵 ช่องทางการขาย</div>';
  html += '<button class="btn btn-primary btn-sm" onclick="modalEditChannel(null)">➕ เพิ่ม</button>';
  html += '</div>';

  var channels = ST.getChannels();
  html += '<div class="admin-actions">';
  for (var ci = 0; ci < channels.length; ci++) {
    var ch = channels[ci];
    html += '<div class="admin-action-card" style="padding:10px 14px;">';
    html += '<div class="flex gap-8" style="align-items:center;flex:1;">';
    html += '<span style="font-size:20px;">' + (ch.emoji || '🏪') + '</span>';
    html += '<span class="fw-600">' + sanitize(ch.name) + '</span>';
    html += '</div>';
    html += '<div class="flex gap-6" style="align-items:center;">';
    html += '<label class="toggle-wrap" onclick="event.stopPropagation(); toggleChannelActive(\'' + sanitize(ch.id) + '\', this)" style="gap:6px;">';
    html += '<div class="toggle' + (ch.active !== false ? ' on' : '') + '" style="width:36px;height:20px;"></div>';
    html += '</label>';
    html += '<button class="btn-icon" onclick="modalEditChannel(findById(ST.getChannels(),\'' + sanitize(ch.id) + '\'))" style="width:30px;height:30px;font-size:14px;">✏️</button>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  html += '</div>'; /* end Channels card */

    /* === [Pro] Line Notify === */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">💬 LINE Notify</div></div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">LINE Notify Token</label>';
  html += '<input type="text" id="cfgLineToken" value="' + sanitize(cfg.lineNotifyToken || '') + '" placeholder="xxxxxxxxxxxxxxx">';
  html += '<div class="form-hint">สร้าง Token ที่ <a href="https://notify-bot.line.me" target="_blank">notify-bot.line.me</a></div>';
  html += '</div>';

  html += '<div class="flex gap-8 flex-wrap">';
  html += '<button class="btn btn-secondary btn-sm" onclick="testLineNotify()">🔔 ทดสอบส่ง</button>';
  html += '<button class="btn btn-primary btn-sm" onclick="sendDailySummaryLine()">📊 ส่งสรุปวันนี้</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="copyDailySummary()">📋 Copy สรุป</button>';
  html += '</div>';

  html += '</div>';

  /* === Quick Cash === */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">💵 ปุ่มเงินด่วน</div></div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">จำนวนเงิน (คั่นด้วย , )</label>';
  var qcAmounts = (cfg.quickCashAmounts || [20, 50, 100, 500, 1000]).join(', ');
  html += '<input type="text" id="cfgQuickCash" value="' + sanitize(qcAmounts) + '" placeholder="20, 50, 100, 500, 1000">';
  html += '<div class="form-hint">ปุ่ม "พอดี" จะแสดงอัตโนมัติ</div>';
  html += '</div>';

  html += '<div class="flex flex-wrap gap-6">';
  html += '<span class="btn btn-success btn-sm" style="pointer-events:none;">💰 พอดี ฿XX</span>';
  var previewAmts = cfg.quickCashAmounts || [20, 50, 100, 500, 1000];
  for (var qa = 0; qa < previewAmts.length; qa++) {
    html += '<span class="btn btn-secondary btn-sm" style="pointer-events:none;">' + formatMoneySign(previewAmts[qa]) + '</span>';
  }
  html += '</div>';

  html += '</div>'; /* end Quick Cash card */

  /* === Receipt === */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🧾 ใบเสร็จ</div></div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ขนาดกระดาษ</label>';
  html += '<select id="cfgReceiptWidth">';
  html += '<option value="58mm"' + (cfg.receiptWidth === '58mm' ? ' selected' : '') + '>58mm (Thermal เล็ก)</option>';
  html += '<option value="80mm"' + (cfg.receiptWidth === '80mm' ? ' selected' : '') + '>80mm (Thermal ปกติ)</option>';
  html += '<option value="a4"' + (cfg.receiptWidth === 'a4' ? ' selected' : '') + '>A4</option>';
  html += '</select>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ข้อความท้ายใบเสร็จ</label>';
  html += '<input type="text" id="cfgReceiptFooter" value="' + sanitize(cfg.receiptFooter || '') + '" placeholder="ขอบคุณที่ใช้บริการ">';
  html += '</div>';

  html += '</div>'; /* end Receipt card */

  /* === Theme === */
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

  html += '</div>'; /* end Theme card */

   /* Hold Order Settings */
html += '<div class="card mb-16">';
html += '<div class="card-header"><div class="card-title">💾 การตั้งค่าออเดอร์ค้าง</div></div>';
html += '<div class="form-group">';
html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
html += '<div class="toggle' + (cfg.autoClearHoldOrder ? ' on' : '') + '" id="cfgAutoClearHold"></div>';
html += '<span>ล้างออเดอร์ค้างอัตโนมัติ (7 วัน)</span>';
html += '</label>';
html += '</div>';
html += '</div>';

/* === Auto Refresh Settings (Pro) === */
if (typeof FeatureManager !== 'undefined' && FeatureManager.isEnabled('pro_realtime')) {
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">🔄 Real-time Dashboard</div></div>';
  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (cfg.autoRefreshEnabled ? ' on' : '') + '" id="cfgAutoRefresh"></div>';
  html += '<span>เปิด Auto-refresh หน้ารายงาน</span>';
  html += '</label>';
  html += '</div>';
  html += '<div class="form-group">';
  html += '<label class="form-label">Interval (วินาที)</label>';
  html += '<input type="number" id="cfgAutoRefreshInterval" value="' + (cfg.autoRefreshInterval || 30) + '" min="10" max="300" step="5">';
  html += '</div>';
  html += '</div>';
}

/* === Kitchen Display Button === */
if (typeof FeatureManager !== 'undefined' && FeatureManager.isEnabled('pro_kds')) {
  html += '<div class="card mb-16">';
  html += '<div class="card-header">';
  html += '<div class="card-title">🍳 Kitchen Display</div>';
  html += '</div>';
  html += '<div class="text-center p-16">';
  html += '<div style="font-size:48px;margin-bottom:12px;">🍳</div>';
  html += '<div class="fw-600 mb-4">เปิดจอแสดงผลสำหรับครัว</div>';
  html += '<div class="text-muted fs-sm mb-12">แยกหน้าต่างสำหรับพนักงานครัว ดูออเดอร์ที่เข้ามา</div>';
  html += '<button class="btn btn-primary" onclick="openKitchenDisplayFromAdmin()" style="padding:10px 24px;">';
  html += '🖥️ เปิด Kitchen Display</button>';
  html += '</div>';
  html += '</div>';
}

  /* === Save Button === */
  html += '<button class="btn btn-primary btn-lg btn-block" onclick="saveShopSettings()">💾 บันทึกการตั้งค่า</button>';

  return html;
}

/* ============================================
   SAVE SHOP SETTINGS
   ============================================ */
function saveShopSettings() {
  var cfg = ST.getConfig();

  cfg.shopName = ($('cfgShopName') || {}).value || 'Coffee POS';
  cfg.currency = ($('cfgCurrency') || {}).value || '฿';
  cfg.orderPrefix = ($('cfgOrderPrefix') || {}).value || '#';

  /* Feature toggles */
  cfg.showStock = hasClass($('cfgShowStock'), 'on');
  cfg.showStaff = hasClass($('cfgShowStaff'), 'on');

  /* VAT / SC */
  cfg.vatEnabled = hasClass($('cfgVatEnabled'), 'on');
  cfg.vatRate = parseFloat(($('cfgVatRate') || {}).value) || 7;
  cfg.serviceChargeEnabled = hasClass($('cfgSCEnabled'), 'on');
  cfg.serviceChargeRate = parseFloat(($('cfgSCRate') || {}).value) || 10;

  /* Sound */
  cfg.soundEnabled = hasClass($('cfgSoundEnabled'), 'on');

  /* PromptPay */
  var ppIdEl = $('cfgPPId');
  var ppNameEl = $('cfgPPName');
  cfg.promptPayEnabled = hasClass($('cfgPPEnabled'), 'on');
  cfg.promptPayId = (ppIdEl && ppIdEl.value) ? ppIdEl.value.replace(/[^0-9]/g, '') : '';
  cfg.promptPayName = (ppNameEl && ppNameEl.value) ? ppNameEl.value : '';

  /* Receipt */
  cfg.receiptWidth = ($('cfgReceiptWidth') || {}).value || '80mm';
  cfg.receiptFooter = ($('cfgReceiptFooter') || {}).value || 'ขอบคุณที่ใช้บริการ';

  /* Quick Cash */
  var qcRaw = ($('cfgQuickCash') || {}).value || '';
  var qcParts = qcRaw.split(',');
  var qcArr = [];
  for (var qc = 0; qc < qcParts.length; qc++) {
    var n = parseInt(qcParts[qc].trim(), 10);
    if (n > 0) qcArr.push(n);
  }
  if (qcArr.length === 0) qcArr = [20, 50, 100, 500, 1000];
  cfg.quickCashAmounts = qcArr;
  
  /* LINE Notify */
  var lineTokenEl = $('cfgLineToken');
  cfg.lineNotifyToken = (lineTokenEl && lineTokenEl.value) ? lineTokenEl.value.trim() : '';

  /* Auto Refresh */
  cfg.autoRefreshEnabled = hasClass($('cfgAutoRefresh'), 'on');
  cfg.autoRefreshInterval = parseInt(($('cfgAutoRefreshInterval') || {}).value) || 30;

  /* ===== NEW: Hold Order Settings (เพิ่มตรงนี้) ===== */
  cfg.autoClearHoldOrder = hasClass($('cfgAutoClearHold'), 'on');

  /* Save config */
  ST.saveConfig(cfg);
  
  /* Apply settings */
  applyShopName();

  if (typeof applyFeatureToggle === 'function') applyFeatureToggle();

  if (typeof AutoRefresh !== 'undefined') {
    if (cfg.autoRefreshEnabled) {
      AutoRefresh.setEnabled(true);
      AutoRefresh.setInterval(cfg.autoRefreshInterval);
    } else {
      AutoRefresh.setEnabled(false);
    }
  }

  toast('บันทึกการตั้งค่าแล้ว', 'success');
  if (typeof playSound === 'function') playSound('success');
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
   [Standard Version] CHANNEL FUNCTIONS
   ============================================ */
function toggleChannelActive(chId, wrap) {
  var toggle = wrap.querySelector('.toggle');
  if (toggle) toggleClass(toggle, 'on');
  var isOn = hasClass(toggle, 'on');
  ST.updateChannel(chId, { active: isOn });
  vibrate(20);
}

function modalEditChannel(ch) {
  var isNew = !ch;
  var c = ch || {};
  var emojiList = ['🚶', '🟢', '🟡', '🔴', '📱', '📞', '🏪', '🛵', '🚗', '💻', '📦'];

  var html = '';
  html += '<div class="form-group">';
  html += '<label class="form-label">ชื่อช่องทาง *</label>';
  html += '<input type="text" id="fChName" value="' + sanitize(c.name || '') + '" placeholder="เช่น Grab, Walk-in">';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">ไอคอน</label>';
  html += '<div class="flex flex-wrap gap-6">';
  for (var i = 0; i < emojiList.length; i++) {
    var selE = ((c.emoji || '🏪') === emojiList[i]) ? ' active' : '';
    html += '<button class="opt-btn-sm' + selE + '" style="flex:none;width:40px;min-width:40px;height:40px;font-size:20px;padding:0;" data-emoji="' + emojiList[i] + '" onclick="selectChEmoji(this)">' + emojiList[i] + '</button>';
  }
  html += '</div>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (c.active !== false ? ' on' : '') + '" id="fChActive"></div>';
  html += '<span>เปิดใช้งาน</span>';
  html += '</label>';
  html += '</div>';

  html += '<input type="hidden" id="fChId" value="' + sanitize(c.id || '') + '">';
  html += '<input type="hidden" id="fChEmoji" value="' + sanitize(c.emoji || '🏪') + '">';

  var footer = '';
  if (!isNew) footer += '<button class="btn btn-danger btn-sm" onclick="deleteChFromModal()">🗑 ลบ</button>';
  footer += '<button class="btn btn-secondary" onclick="closeMForce()">ยกเลิก</button>';
  footer += '<button class="btn btn-primary" onclick="saveChFromModal()">' + (isNew ? '➕ เพิ่ม' : '💾 บันทึก') + '</button>';

  openModal(isNew ? '➕ เพิ่มช่องทาง' : '✏️ แก้ไขช่องทาง', html, footer);
}

function selectChEmoji(el) {
  var siblings = el.parentNode.querySelectorAll('.opt-btn-sm');
  for (var i = 0; i < siblings.length; i++) removeClass(siblings[i], 'active');
  addClass(el, 'active');
  var hidden = $('fChEmoji');
  if (hidden) hidden.value = el.getAttribute('data-emoji');
  vibrate(20);
}

function saveChFromModal() {
  var id = ($('fChId') || {}).value;
  var name = ($('fChName') || {}).value.trim();
  if (!name) { toast('กรุณาใส่ชื่อ', 'error'); return; }
  var data = {
    name: name,
    emoji: ($('fChEmoji') || {}).value || '🏪',
    active: hasClass($('fChActive'), 'on')
  };
  if (id) { ST.updateChannel(id, data); toast('อัพเดตแล้ว', 'success'); }
  else { ST.addChannel(data); toast('เพิ่มแล้ว', 'success'); }
  closeMForce();
  renderAdminView();
}

function deleteChFromModal() {
  var id = ($('fChId') || {}).value;
  if (!id) return;
  confirmDialog('ลบช่องทางนี้?', function() {
    ST.deleteChannel(id);
    closeMForce();
    toast('ลบแล้ว', 'warning');
    renderAdminView();
  });
}

/* ============================================
   TAB: STAFF
   ============================================ */
function renderStaffSettings() {
  var staffList = ST.getStaff();
  var shifts = ST.getShifts();

  var html = '';

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
    html += '<div class="staff-grid stagger">';
    for (var i = 0; i < staffList.length; i++) {
      html += renderStaffCard(staffList[i], shifts);
    }
    html += '</div>';
  }

  /* Current staff */
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
    html += '<div class="text-muted mb-12">ยังไม่ได้เข้าสู่ระบบ</div>';
    html += '<button class="btn btn-primary" onclick="showPinLogin()">🔐 เข้าสู่ระบบ (PIN)</button>';
    html += '</div>';
  }
  html += '</div>';

  /* Today shifts */
  var todayShifts = getTodayShifts(shifts, staffList);
  if (todayShifts.length > 0) {
    html += '<div class="card mt-16">';
    html += '<div class="card-header"><div class="card-title">📋 กะวันนี้</div></div>';
    html += '<div class="table-wrap"><table>';
    html += '<thead><tr><th>พนักงาน</th><th>เข้า</th><th>ออก</th><th>ชม.</th></tr></thead>';
    html += '<tbody>';
    for (var t = 0; t < todayShifts.length; t++) {
      var sh = todayShifts[t];
      var hrs = calcShiftHours(sh);
      html += '<tr>';
      html += '<td class="fw-600">' + sanitize(sh.staffName) + '</td>';
      html += '<td>' + sanitize(sh.clockIn) + '</td>';
      html += '<td>' + (sh.clockOut ? sanitize(sh.clockOut) : '<span class="badge badge-success">ทำงาน</span>') + '</td>';
      html += '<td>' + (hrs ? hrs + 'h' : '-') + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table></div></div>';
  }

  return html;
}

function renderStaffCard(staff, allShifts) {
  var isActive = staff.active !== false;
  var activeShift = ST.getActiveShift(staff.id);

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

  html += '<div class="flex-between mb-8">';
  html += '<div class="flex gap-8" style="align-items:center;">';
  html += '<div class="staff-avatar">' + getInitials(staff.name) + '</div>';
  html += '<div>';
  html += '<div class="fw-700">' + sanitize(staff.name) + '</div>';
  html += '<div class="text-muted fs-sm">' + getRoleName(staff.role) + '</div>';
  html += '</div></div>';
  html += '<div class="flex gap-4" style="align-items:center;">';
  if (activeShift) html += '<span class="badge badge-success">🟢</span>';
  if (!isActive) html += '<span class="badge badge-danger">ปิด</span>';
  html += '</div></div>';

  if (staffOrders > 0) {
    html += '<div class="flex gap-12 mb-8">';
    html += '<div class="fs-sm"><span class="text-muted">วันนี้:</span> <span class="fw-600">' + staffOrders + ' บิล</span></div>';
    html += '<div class="fs-sm"><span class="text-muted">ยอด:</span> <span class="fw-700 text-accent">' + formatMoneySign(staffSales) + '</span></div>';
    html += '</div>';
  }

  html += '<div class="flex gap-6 mt-8" style="border-top:1px solid var(--border);padding-top:8px;">';
  html += '<button class="btn btn-secondary btn-sm" onclick="modalEditStaff(findById(ST.getStaff(),\'' + sanitize(staff.id) + '\'))">✏️</button>';
  if (isActive) {
    if (activeShift) {
      html += '<button class="btn btn-warning btn-sm" onclick="doClockOut(\'' + sanitize(staff.id) + '\',\'' + sanitize(activeShift.id) + '\')">🕐 Out</button>';
    } else {
      html += '<button class="btn btn-success btn-sm" onclick="doClockIn(\'' + sanitize(staff.id) + '\')">🕐 In</button>';
    }
  }
  html += '</div></div>';
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
  var inP = shift.clockIn.split(':');
  var outP = end.split(':');
  var inMin = parseInt(inP[0], 10) * 60 + parseInt(inP[1], 10);
  var outMin = parseInt(outP[0], 10) * 60 + parseInt(outP[1], 10);
  var diff = outMin - inMin;
  if (diff < 0) diff += 1440;
  return roundTo(diff / 60, 1);
}

function doClockIn(staffId) {
  ST.clockIn(staffId);
  var staff = findById(ST.getStaff(), staffId);
  toast((staff ? staff.name : '') + ' Clock In', 'success');
  renderAdminView();
}

function doClockOut(staffId, shiftId) {
  ST.clockOut(shiftId);
  var staff = findById(ST.getStaff(), staffId);
  toast((staff ? staff.name : '') + ' Clock Out', 'info');
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
  html += '<span class="pin-dot"></span><span class="pin-dot"></span><span class="pin-dot"></span><span class="pin-dot"></span>';
  html += '</div>';

  html += '<div id="pinError" class="text-danger text-center fs-sm mb-8" style="min-height:20px;"></div>';

  html += '<div class="pin-pad">';
  for (var n = 1; n <= 9; n++) {
    html += '<button class="pin-key" onclick="pinInput(' + n + ')">' + n + '</button>';
  }
  html += '<button class="pin-key" onclick="pinClear()">⌫</button>';
  html += '<button class="pin-key" onclick="pinInput(0)">0</button>';
  html += '<button class="pin-key pin-key-enter" onclick="pinSubmit()">✓</button>';
  html += '</div>';

  html += '<input type="hidden" id="pinValue" value="">';

  openModal('🔐 เข้าสู่ระบบ', html, '<button class="btn btn-secondary" onclick="closeMForce()">ยกเลิก</button>');
}

function pinInput(num) {
  var el = $('pinValue');
  if (!el || el.value.length >= 4) return;
  el.value += num;
  updatePinDots(el.value.length);
  vibrate(20);
  if (el.value.length === 4) setTimeout(pinSubmit, 200);
}

function pinClear() {
  var el = $('pinValue');
  if (!el) return;
  if (el.value.length > 0) {
    el.value = el.value.substring(0, el.value.length - 1);
    updatePinDots(el.value.length);
  }
  setText('pinError', '');
  vibrate(20);
}

function updatePinDots(filled) {
  var dots = qsa('.pin-dot');
  for (var i = 0; i < dots.length; i++) {
    if (i < filled) addClass(dots[i], 'filled');
    else removeClass(dots[i], 'filled');
  }
}

function pinSubmit() {
  var el = $('pinValue');
  if (!el) return;
  var pin = el.value;
  if (pin.length !== 4) { setText('pinError', 'กรอก 4 หลัก'); return; }

  var staff = ST.verifyPin(pin);
  if (staff) {
    APP.currentStaff = staff;
    setText('topStaff', '👤 ' + staff.name);
    closeMForce();
    toast('ยินดีต้อนรับ ' + staff.name, 'success');
    if (typeof playSound === 'function') playSound('success');
    var activeShift = ST.getActiveShift(staff.id);
    if (!activeShift) {
      ST.clockIn(staff.id);
      toast(staff.name + ' Clock In', 'info', 2000);
    }
    if (APP.currentView === 'admin') renderAdminView();
  } else {
    setText('pinError', '❌ PIN ไม่ถูกต้อง');
    el.value = '';
    updatePinDots(0);
    vibrate(100);
    if (typeof playSound === 'function') playSound('error');
  }
}

function logoutStaff() {
  if (!APP.currentStaff) return;
  confirmDialog('ออกจากระบบ ' + APP.currentStaff.name + '?', function() {
    var activeShift = ST.getActiveShift(APP.currentStaff.id);
    if (activeShift) ST.clockOut(activeShift.id);
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
  html += '<span class="text-muted">ใช้ทั้งหมด</span>';
  html += '<span class="fw-700">' + info.totalFormatted + '</span>';
  html += '</div>';

  var keys = ST._keys;
  var barColors = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16', '#f59e0b', '#10b981'];
  html += '<div class="storage-bars">';
  for (var i = 0; i < keys.length; i++) {
    var size = info.details[keys[i]] || 0;
    if (size === 0) continue;
    var pctW = info.total > 0 ? (size / info.total) * 100 : 0;
    html += '<div class="storage-bar-row">';
    html += '<div class="flex-between fs-sm"><span class="fw-600">' + keys[i] + '</span><span class="text-muted">' + formatSize(size) + '</span></div>';
    html += '<div class="stock-bar mt-4"><div class="stock-bar-fill" style="width:' + Math.max(2, pctW) + '%;background:' + barColors[i % barColors.length] + ';"></div></div>';
    html += '</div>';
  }
  html += '</div></div>';

  /* Export/Import */
  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">📤 Export / Import</div></div>';
  html += '<div class="admin-actions">';

  html += adminActionCard('📥', 'Backup JSON', 'ดาวน์โหลดข้อมูลทั้งหมด', 'exportJSON()');
  html += adminActionCard('📤', 'Restore JSON', 'นำเข้าจากไฟล์ JSON', 'importJSONTrigger()');
  html += adminActionCard('📊', 'Export ยอดขาย CSV', 'ออเดอร์สำหรับ Excel', 'exportCSVOrders()');
  html += adminActionCard('📋', 'Export เมนู CSV', 'รายการเมนูทั้งหมด', 'exportCSVMenu()');
  html += adminActionCard('📝', 'Copy สรุปวันนี้', 'คัดลอกวาง Line / Sheets', 'copySalesReport()');

  html += '</div></div>';

  html += '<input type="file" id="importFileInput" accept=".json" style="display:none;" onchange="importJSONFile(this)">';

  /* Danger Zone */
  html += '<div class="card mb-16" style="border-color:var(--danger);">';
  html += '<div class="card-header"><div class="card-title text-danger">⚠️ Danger Zone</div></div>';
  html += '<div class="admin-actions">';
  html += adminActionCard('🗑', 'ล้างออเดอร์ทั้งหมด', 'ลบออเดอร์ (เมนูยังอยู่)', 'clearAllOrders()', true);
  html += adminActionCard('💣', 'Reset ทั้งหมด', 'ลบทุกอย่าง กลับสู่เริ่มต้น', 'resetAllData()', true);
  html += adminActionCard('🧪', 'โหลดข้อมูลตัวอย่าง', 'เพิ่มเมนู + วัตถุดิบ', 'loadSampleData()');
  html += '</div></div>';

  return html;
}

function adminActionCard(icon, title, desc, onclick, isDanger) {
  var cls = isDanger ? ' danger' : '';
  var titleCls = isDanger ? ' text-danger' : '';
  return '<div class="admin-action-card' + cls + '" onclick="' + onclick + '">'
    + '<div class="admin-action-icon">' + icon + '</div>'
    + '<div class="admin-action-info">'
    + '<div class="fw-600' + titleCls + '">' + title + '</div>'
    + '<div class="text-muted fs-sm">' + desc + '</div>'
    + '</div></div>';
}

function clearAllOrders() {
  var orders = ST.getOrders();
  confirmDialog('ล้างออเดอร์ทั้งหมด ' + orders.length + ' รายการ?', function() {
    ST.saveOrders([]);
    toast('ล้างออเดอร์แล้ว', 'warning');
    renderAdminView();
  });
}

function resetAllData() {
  confirmDialog('⚠️ Reset ข้อมูลทั้งหมด?\nไม่สามารถกู้คืนได้!', function() {
    ST.clearAll();
    APP.currentStaff = null;
    setText('topStaff', '');
    applyShopName();
    if (typeof applyFeatureToggle === 'function') applyFeatureToggle();
    toast('Reset แล้ว', 'warning');
    nav('pos');
  });
}

function loadSampleData() {
  confirmDialog('เพิ่มเมนูตัวอย่าง? (ข้อมูลเดิมไม่ถูกลบ)', function() {
    ST.seedSampleData();
    renderAdminView();
  });
}

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
      confirmDialog('นำเข้าจาก ' + file.name + '?\nข้อมูลเดิมจะถูกแทนที่', function() {
        ST.importAll(data);
        applyShopName();
        applyTheme();
        if (typeof applyFeatureToggle === 'function') applyFeatureToggle();
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
  html += '<div class="text-muted mb-4">Standard Version 1.2</div>';
  html += '<div class="text-muted fs-sm">ระบบ POS สำหรับร้านกาแฟ</div>';
  html += '</div>';

  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">📱 เทคโนโลยี</div></div>';
  html += '<div class="about-tech">';
  html += aboutRow('Frontend', 'HTML + CSS + JS (ES5)');
  html += aboutRow('Storage', 'localStorage + Firebase');
  html += aboutRow('Auth', 'Google Auth + PIN');
  html += aboutRow('Hosting', 'GitHub Pages');
  html += aboutRow('PWA', 'Service Worker + Offline');
  html += aboutRow('Theme', 'Dark / Light');
  html += aboutRow('Payment', 'Cash / Transfer / PromptPay QR');
  html += aboutRow('Channels', 'Walk-in / Grab / LINE MAN / Custom');
  html += '</div></div>';

  html += '<div class="card mb-16">';
  html += '<div class="card-header"><div class="card-title">⌨️ Shortcuts</div></div>';
  html += '<div class="about-tech">';
  html += aboutRow('F1', 'POS');
  html += aboutRow('F2', 'Orders');
  html += aboutRow('F3', 'Report');
  html += aboutRow('Esc', 'ปิด Modal');
  html += '</div></div>';

  html += '<div class="card">';
  html += '<div class="card-header"><div class="card-title">🔗 Cloud</div></div>';
  if (typeof _fbUser !== 'undefined' && _fbUser) {
    html += '<div class="p-16"><span class="badge badge-success">🟢 Connected</span> ' + sanitize(_fbUser.email || '') + '</div>';
  } else {
    html += '<div class="p-16 text-center"><div class="text-muted mb-12">ยังไม่ได้เชื่อมต่อ</div>';
    html += '<button class="btn btn-primary" onclick="handleAuth()">🔐 Login Google</button></div>';
  }
  html += '</div>';

  return html;
}

function aboutRow(label, value) {
  return '<div class="about-row"><span class="fw-600">' + sanitize(label) + '</span><span class="text-muted">' + sanitize(value) + '</span></div>';
}

/* ============================================
   [Pro] PROMPTPAY ACCOUNT MODAL
   ============================================ */
function modalEditPromptPay(acc) {
  var isNew = !acc;
  var a = acc || {};

  var html = '';
  html += '<div class="form-group">';
  html += '<label class="form-label">ชื่อบัญชี *</label>';
  html += '<input type="text" id="fPPName" value="' + sanitize(a.name || '') + '" placeholder="เช่น บัญชีร้าน, บัญชีส่วนตัว">';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="form-label">เบอร์โทร หรือ เลขบัตรประชาชน *</label>';
  html += '<input type="text" id="fPPId" value="' + sanitize(a.ppId || '') + '" placeholder="0812345678" inputmode="numeric">';
  html += '<div class="form-hint">เบอร์โทร 10 หลัก หรือ เลขบัตร 13 หลัก</div>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label class="toggle-wrap" onclick="toggleToggle(this)">';
  html += '<div class="toggle' + (a.isDefault ? ' on' : '') + '" id="fPPDefault"></div>';
  html += '<span>ตั้งเป็นบัญชีหลัก</span>';
  html += '</label>';
  html += '</div>';

  /* Preview */
  html += '<div id="ppPreviewArea"></div>';

  html += '<input type="hidden" id="fPPAccId" value="' + sanitize(a.id || '') + '">';

  var footer = '';
  if (!isNew) footer += '<button class="btn btn-danger btn-sm" onclick="deletePPFromModal()">🗑 ลบ</button>';
  footer += '<button class="btn btn-secondary" onclick="closeMForce()">ยกเลิก</button>';
  footer += '<button class="btn btn-primary" onclick="savePPFromModal()">' + (isNew ? '➕ เพิ่ม' : '💾 บันทึก') + '</button>';

  openModal(isNew ? '➕ เพิ่มบัญชี PromptPay' : '✏️ แก้ไขบัญชี', html, footer);
}

function savePPFromModal() {
  var id = ($('fPPAccId') || {}).value;
  var name = ($('fPPName') || {}).value.trim();
  var ppId = ($('fPPId') || {}).value.replace(/[^0-9]/g, '');
  if (!name) { toast('กรุณาใส่ชื่อบัญชี', 'error'); return; }
  if (!ppId || (ppId.length !== 10 && ppId.length !== 13)) {
    toast('เบอร์โทร 10 หลัก หรือ เลขบัตร 13 หลัก', 'error');
    return;
  }
  var isDefault = hasClass($('fPPDefault'), 'on');

  if (id) {
    ST.updatePromptPayAccount(id, { name: name, ppId: ppId });
    if (isDefault) ST.setDefaultPromptPay(id);
    toast('อัพเดตแล้ว', 'success');
  } else {
    var acc = ST.addPromptPayAccount({ name: name, ppId: ppId, isDefault: isDefault });
    if (isDefault) ST.setDefaultPromptPay(acc.id);
    toast('เพิ่มแล้ว', 'success');
  }
  closeMForce();
  renderAdminView();
}

function deletePPFromModal() {
  var id = ($('fPPAccId') || {}).value;
  if (!id) return;
  confirmDialog('ลบบัญชีนี้?', function() {
    ST.deletePromptPayAccount(id);
    closeMForce();
    toast('ลบแล้ว', 'warning');
    renderAdminView();
  });
}

function setDefaultPP(id) {
  ST.setDefaultPromptPay(id);
  toast('ตั้งเป็นบัญชีหลักแล้ว', 'success');
  renderAdminView();
}

/* ============================================
   [Pro] LINE NOTIFY FUNCTIONS
   ============================================ */
function testLineNotify() {
  var token = ($('cfgLineToken') || {}).value.trim();
  if (!token) { toast('กรุณาใส่ Token', 'error'); return; }
  var msg = '\n🔔 ทดสอบจาก ' + (ST.getConfig().shopName || 'Coffee POS') + '\n✅ เชื่อมต่อสำเร็จ!';
  sendLineNotify(token, msg, function(ok) {
    if (ok) toast('✅ ส่งสำเร็จ!', 'success');
  });
}

function sendDailySummaryLine() {
  var cfg = ST.getConfig();
  var token = cfg.lineNotifyToken;
  if (!token) { toast('กรุณาตั้งค่า LINE Token ก่อน', 'error'); return; }
  var msg = buildDailySummaryMessage();
  sendLineNotify(token, msg, function(ok) {
    if (ok) toast('✅ ส่งสรุปแล้ว!', 'success');
  });
}

function copyDailySummary() {
  var msg = buildDailySummaryMessage();
  copyText(msg);
}

/* ============================================
   ADDITIONAL CSS
   ============================================ */
(function() {
  var styleId = 'adminViewStyle';
  if (document.getElementById(styleId)) return;

  var css = '';

  css += '.theme-selector{display:flex;gap:12px;padding:8px 0;}';
  css += '.theme-option{flex:1;padding:12px;border:2px solid var(--border);border-radius:var(--radius);cursor:pointer;text-align:center;transition:all var(--transition);}';
  css += '.theme-option:hover{border-color:var(--accent);}';
  css += '.theme-option.active{border-color:var(--accent);background:rgba(249,115,22,0.08);}';
  css += '.theme-preview{height:40px;border-radius:var(--radius-sm);margin-bottom:8px;}';
  css += '.dark-preview{background:linear-gradient(135deg,#0f0f1a,#1a1a2e);}';
  css += '.light-preview{background:linear-gradient(135deg,#f5f5f5,#ffffff);border:1px solid #ddd;}';

  css += '.admin-actions{display:flex;flex-direction:column;gap:6px;}';
  css += '.admin-action-card{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all var(--transition);}';
  css += '.admin-action-card:hover{border-color:var(--accent);background:var(--glass);}';
  css += '.admin-action-card.danger:hover{border-color:var(--danger);background:rgba(239,68,68,0.05);}';
  css += '.admin-action-icon{font-size:24px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}';
  css += '.admin-action-info{flex:1;min-width:0;}';

  css += '.storage-bars{display:flex;flex-direction:column;gap:8px;}';
  css += '.storage-bar-row{padding:2px 0;}';

  css += '.staff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;}';
  css += '.staff-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;transition:all var(--transition);}';
  css += '.staff-card:hover{border-color:var(--accent);}';
  css += '.staff-card.inactive{opacity:0.5;}';
  css += '.staff-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));';
  css += 'display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0;}';

  css += '.pin-display{display:flex;justify-content:center;gap:16px;margin-bottom:16px;}';
  css += '.pin-dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--border);transition:all var(--transition);}';
  css += '.pin-dot.filled{background:var(--accent);border-color:var(--accent);}';
  css += '.pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:260px;margin:0 auto;}';
  css += '.pin-key{height:52px;font-size:22px;font-weight:700;border-radius:var(--radius-sm);';
  css += 'background:var(--bg-card);border:1px solid var(--border);transition:all var(--transition);display:flex;align-items:center;justify-content:center;}';
  css += '.pin-key:hover{border-color:var(--accent);}';
  css += '.pin-key:active{transform:scale(0.92);background:var(--accent);color:#fff;}';
  css += '.pin-key-enter{background:var(--success);color:#fff;border-color:var(--success);}';

  css += '.about-tech{display:flex;flex-direction:column;}';
  css += '.about-row{display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border);}';
  css += '.about-row:last-child{border-bottom:none;}';

  css += '@media(max-width:768px){';
  css += '.staff-grid{grid-template-columns:1fr;}';
  css += '}';

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ============================================
   ADMIN TAB: RECIPE (Pro Feature)
   ============================================ */
function renderRecipeAdminTab() {
  /* Check if Pro feature is enabled */
  if (typeof FeatureManager !== 'undefined' && !FeatureManager.isEnabled('pro_recipe')) {
    return renderFeatureLockedAdmin('pro_recipe', '🧪 สูตรวัตถุดิบ (Recipe)');
  }
  
  /* Return container for recipe view */
  return '<div id="recipeViewContainer" class="recipe-container"></div>';
}

function renderFeatureLockedAdmin(featureId, featureName) {
  var licenseTier = (typeof FeatureManager !== 'undefined') ? FeatureManager.getLicenseTier() : 'standard';
  
  var html = '<div class="card p-20 text-center">';
  html += '<div style="font-size:48px;margin-bottom:12px;">🔒</div>';
  html += '<div class="fw-700 fs-lg mb-4">' + featureName + '</div>';
  html += '<div class="text-muted mb-4">ฟีเจอร์นี้ต้องมี Pro License</div>';
  html += '<div class="text-muted fs-sm mb-16">License ปัจจุบัน: ' + 
    (licenseTier === 'pro' ? '⭐ Pro' : '📦 Standard') + '</div>';
  
  if (licenseTier !== 'pro') {
    html += '<button class="btn btn-primary" onclick="LicenseManager.showLicenseModal()">🔑 อัปเกรดเป็น Pro</button>';
  } else {
    html += '<div class="text-warning">⚠️ ฟีเจอร์นี้ถูกปิดไว้ใน Super Admin กรุณาเปิดใช้งาน</div>';
  }
  html += '</div>';
  
  return html;
}

/* ============================================
   OPEN KITCHEN DISPLAY FROM ADMIN
   ============================================ */
function openKitchenDisplayFromAdmin() {
  if (typeof KitchenDisplay !== 'undefined' && KitchenDisplay.openKitchenDisplay) {
    KitchenDisplay.openKitchenDisplay();
  } else {
    /* Fallback: เปิด URL โดยตรง */
    var kitchenUrl = window.location.href.split('#')[0] + '?mode=kitchen';
    window.open(kitchenUrl, '_blank', 'width=1024,height=768');
  }
  toast('กำลังเปิด Kitchen Display...', 'info');
}

console.log('[admin.js] loaded');
