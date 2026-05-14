/* ============================================
   COFFEE POS — SUPER ADMIN SYSTEM
   เข้าถึง: กดโลโก้ 5 ครั้ง / Console / ค้นหา "admin"
   Version: 2.0 (Full Feature Management)
   ============================================ */

/* Ensure ST exists */
if (typeof ST === 'undefined') {
  var ST = {
    getObj: function(key, fallback) { return fallback; },
    setObj: function(key, val) { console.log('[ST]', key, val); }
  };
}

var SuperAdmin = {
  isLoggedIn: false,
  defaultPassword: '0000',
  currentPassword: null,
  loginAttempts: 0,
  maxAttempts: 5,
  logoClickCount: 0,
  logoClickTimer: null,

  /* ============================================
     INIT
     ============================================ */
  init: function() {
    /* Load from storage */
    var saved = ST.getObj('super_admin', null);
    if (!saved) {
      /* First time setup */
      ST.setObj('super_admin', {
        password: this.defaultPassword,
        isSetup: true,
        setupAt: Date.now()
      });
      this.currentPassword = this.defaultPassword;
    } else {
      this.currentPassword = saved.password;
    }
    
    /* Setup logo click listener */
    this.setupLogoListener();
    
    /* Setup search listener */
    this.setupSearchListener();
    
    /* Expose to console */
    window.openSuperAdmin = function() {
      SuperAdmin.showLoginModal();
    };
    
    /* Expose feature manager to console */
    window.FeatureManager = FeatureManager;
    
    console.log('[SuperAdmin] ready — 3 ways to access:');
    console.log('  1. กดโลโก้ ☕ ที่ header 5 ครั้ง');
    console.log('  2. พิมพ์ openSuperAdmin() ใน console');
    console.log('  3. พิมพ์ "admin" ในช่องค้นหาเมนู');
  },

  /* ============================================
     1. LOGO CLICK DETECTION
     ============================================ */
  setupLogoListener: function() {
    var self = this;
    
    var checkInterval = setInterval(function() {
      var logo = document.querySelector('.brand-icon, .brand-name, #shopName');
      if (logo) {
        clearInterval(checkInterval);
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function(e) {
          e.stopPropagation();
          self.onLogoClick();
        });
      }
    }, 500);
  },

  onLogoClick: function() {
    this.logoClickCount++;
    
    if (this.logoClickTimer) clearTimeout(this.logoClickTimer);
    
    this.logoClickTimer = setTimeout(function() {
      SuperAdmin.logoClickCount = 0;
    }, 1000);
    
    if (this.logoClickCount >= 5) {
      this.logoClickCount = 0;
      this.showLoginModal();
      vibrate(50);
    }
  },

  /* ============================================
     2. SEARCH "admin" DETECTION
     ============================================ */
  setupSearchListener: function() {
    var self = this;
    
    document.addEventListener('input', function(e) {
      if (e.target && (e.target.id === 'posSearch' || e.target.id === 'menuListSearch')) {
        var val = e.target.value;
        if (val && val.toLowerCase() === 'admin') {
          self.showLoginModal();
          e.target.value = '';
        }
      }
    });
  },

  /* ============================================
     LOGIN MODAL
     ============================================ */
  showLoginModal: function() {
    var html = '';
    html += '<div class="text-center mb-16">';
    html += '<div style="font-size:48px;margin-bottom:8px;">👑</div>';
    html += '<div class="fw-700 fs-lg mb-4">Super Admin</div>';
    html += '<div class="text-muted fs-sm">กรุณาใส่รหัสผ่าน</div>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label class="form-label">รหัสผ่าน</label>';
    html += '<input type="password" id="saPassword" placeholder="****" style="font-size:24px;text-align:center;letter-spacing:8px;" maxlength="6" inputmode="numeric">';
    html += '</div>';
    
    if (this.loginAttempts >= this.maxAttempts) {
      html += '<div class="text-danger text-center fs-sm mb-8">❌ หมดโอกาสลองใหม่ รอ 5 นาที</div>';
    }
    
    var footer = '';
    footer += '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';
    footer += '<button class="btn btn-primary" onclick="SuperAdmin.verifyLogin()">เข้าสู่ระบบ</button>';
    
    openModal('👑 Super Admin', html, footer);
    
    setTimeout(function() {
      var input = $('saPassword');
      if (input) input.focus();
    }, 100);
  },

  /* ============================================
     VERIFY PASSWORD
     ============================================ */
  verifyLogin: function() {
    var input = $('saPassword');
    if (!input) return;
    
    var enteredPass = input.value;
    
    if (enteredPass === this.currentPassword) {
      this.isLoggedIn = true;
      this.loginAttempts = 0;
      closeMForce();
      toast('✅ เข้าสู่ระบบ Super Admin', 'success');
      this.showAdminPanel();
    } else {
      this.loginAttempts++;
      var remaining = this.maxAttempts - this.loginAttempts;
      toast('❌ รหัสผิด เหลือ ' + remaining + ' ครั้ง', 'error');
      
      if (this.loginAttempts >= this.maxAttempts) {
        this.lockout();
      }
      
      vibrate(100);
      if (typeof playSound === 'function') playSound('error');
    }
  },

  /* ============================================
     LOCKOUT
     ============================================ */
  lockout: function() {
    var self = this;
    toast('🔒 หมดโอกาสลองใหม่ รอ 5 นาที', 'error');
    setTimeout(function() {
      self.loginAttempts = 0;
      toast('🔓 ลองใหม่ได้แล้ว', 'info');
    }, 300000);
  },

  /* ============================================
     CHANGE PASSWORD
     ============================================ */
  changePassword: function(oldPass, newPass) {
    if (oldPass !== this.currentPassword) {
      toast('รหัสเดิมไม่ถูกต้อง', 'error');
      return false;
    }
    
    if (!newPass || newPass.length < 4) {
      toast('รหัสใหม่อย่างน้อย 4 หลัก', 'error');
      return false;
    }
    
    this.currentPassword = newPass;
    ST.setObj('super_admin', { password: newPass, isSetup: true, setupAt: Date.now() });
    toast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
    return true;
  },

  /* ============================================
     SHOW ADMIN PANEL (Full Feature Management)
     ============================================ */
  showAdminPanel: function() {
    var features = FeatureManager.getAllGrouped();
    var licenseTier = FeatureManager.getLicenseTier();
    var licenseKey = (typeof LicenseManager !== 'undefined' && LicenseManager) ? LicenseManager.getCurrentKey() : null;
    var currentTierName = FeatureManager.getCurrentTierName();
    
    var html = '';
    
    /* Header */
    html += '<div class="text-center mb-16">';
    html += '<div style="font-size:56px;">👑</div>';
    html += '<div class="fw-800 fs-xl mb-2">Super Admin Panel</div>';
    html += '<div class="text-muted fs-sm">License: ' + currentTierName + '</div>';
    if (licenseKey) {
      html += '<div class="text-muted fs-sm">Key: <code>' + sanitize(licenseKey) + '</code></div>';
    }
    html += '</div>';
    
    /* Stats */
    var proCount = features.pro.length;
    var enabledPro = 0;
    for (var i = 0; i < features.pro.length; i++) {
      if (features.pro[i].enabled) enabledPro++;
    }
    
    html += '<div class="kpi-grid mb-16" style="grid-template-columns:repeat(3,1fr);">';
    html += '<div class="kpi-card"><div class="kpi-value">' + features.standard.length + '</div><div class="kpi-label">Standard Features</div></div>';
    html += '<div class="kpi-card"><div class="kpi-value">' + proCount + '</div><div class="kpi-label">Pro Features</div></div>';
    html += '<div class="kpi-card"><div class="kpi-value text-accent">' + enabledPro + '/' + proCount + '</div><div class="kpi-label">Pro Enabled</div></div>';
    html += '</div>';
    
    /* Change Password Section */
    html += '<div class="card mb-16">';
    html += '<div class="card-header"><div class="card-title">🔐 เปลี่ยนรหัสผ่าน Super Admin</div></div>';
    html += '<div class="form-row">';
    html += '<div class="form-group"><label class="form-label">รหัสปัจจุบัน</label>';
    html += '<input type="password" id="saOldPass" placeholder="****" maxlength="6"></div>';
    html += '<div class="form-group"><label class="form-label">รหัสใหม่</label>';
    html += '<input type="password" id="saNewPass" placeholder="****" maxlength="6"></div>';
    html += '<div class="form-group" style="display:flex;align-items:flex-end;"><button class="btn btn-primary btn-sm" onclick="SuperAdmin.changePasswordFromModal()">เปลี่ยนรหัส</button></div>';
    html += '</div>';
    html += '</div>';
    
    /* Preset Section */
    html += '<div class="card mb-16">';
    html += '<div class="card-header">';
    html += '<div class="card-title">📦 Preset การตั้งค่า</div>';
    html += '<div class="text-muted fs-sm">เลือกชุดฟีเจอร์สำเร็จรูป</div>';
    html += '</div>';
    html += '<div class="admin-actions">';
    
    for (var p in FEATURE_PRESETS) {
      var preset = FEATURE_PRESETS[p];
      var isDisabled = (p === 'pro' && licenseTier !== 'pro');
      var disabledAttr = isDisabled ? ' style="opacity:0.5;cursor:not-allowed;"' : '';
      var onclickAttr = !isDisabled ? ' onclick="SuperAdmin.applyPresetWithConfirm(\'' + p + '\')"' : '';
      
      html += '<div class="admin-action-card"' + disabledAttr + onclickAttr + '>';
      html += '<div class="admin-action-icon">' + preset.icon + '</div>';
      html += '<div class="admin-action-info">';
      html += '<div class="fw-600">' + preset.name + '</div>';
      html += '<div class="text-muted fs-sm">' + preset.description + '</div>';
      html += '</div>';
      if (isDisabled) {
        html += '<div><span class="badge badge-warning">ต้องมี Pro License</span></div>';
      }
      html += '</div>';
    }
    
    html += '</div>';
    html += '</div>';
    
    /* Feature Toggles - Core */
    if (features.core.length > 0) {
      html += '<div class="card mb-16">';
      html += '<div class="card-header"><div class="card-title">📌 CORE (เปิดตลอด - เปลี่ยนไม่ได้)</div></div>';
      for (var c = 0; c < features.core.length; c++) {
        var f = features.core[c];
        html += '<div class="admin-action-card" style="opacity:0.7;">';
        html += '<div class="admin-action-icon">' + (f.enabled ? '✅' : '❌') + '</div>';
        html += '<div class="admin-action-info">';
        html += '<div class="fw-600">' + f.name + '</div>';
        html += '<div class="text-muted fs-sm">' + f.description + '</div>';
        html += '</div>';
        html += '<div><span class="badge badge-success">เปิดตลอด</span></div>';
        html += '</div>';
      }
      html += '</div>';
    }
    
    /* Feature Toggles - Standard */
    if (features.standard.length > 0) {
      html += '<div class="card mb-16">';
      html += '<div class="card-header">';
      html += '<div class="card-title">📦 STANDARD FEATURES</div>';
      html += '<div class="text-muted fs-sm">สามารถเปิด/ปิดได้ (Standard License)</div>';
      html += '</div>';
      
      for (var s = 0; s < features.standard.length; s++) {
        var f2 = features.standard[s];
        var isOn = f2.enabled;
        
        html += '<div class="admin-action-card" style="cursor:pointer;" onclick="SuperAdmin.toggleFeatureConfirm(\'' + f2.id + '\', ' + (!isOn) + ')">';
        html += '<div class="admin-action-icon">' + (isOn ? '✅' : '🔒') + '</div>';
        html += '<div class="admin-action-info">';
        html += '<div class="fw-600">' + f2.name + '</div>';
        html += '<div class="text-muted fs-sm">' + f2.description + '</div>';
        html += '</div>';
        html += '<div>' + (isOn ? '<span class="badge badge-success">เปิด</span>' : '<span class="badge badge-danger">ปิด</span>') + '</div>';
        html += '</div>';
      }
      html += '</div>';
    }
    
    /* Feature Toggles - Pro */
    if (features.pro.length > 0) {
      var canEditPro = (licenseTier === 'pro');
      
      html += '<div class="card mb-16">';
      html += '<div class="card-header">';
      html += '<div class="card-title">⭐ PRO FEATURES</div>';
      if (!canEditPro) {
        html += '<div class="text-muted fs-sm text-warning">🔐 ต้องมี Pro License จึงจะเปิดฟีเจอร์เหล่านี้ได้</div>';
      } else {
        html += '<div class="text-muted fs-sm">สามารถเปิด/ปิดได้ (Pro License)</div>';
      }
      html += '</div>';
      
      for (var pr = 0; pr < features.pro.length; pr++) {
        var f3 = features.pro[pr];
        var isOn3 = f3.enabled;
        var canToggle = canEditPro && f3.canToggle;
        
        html += '<div class="admin-action-card" ' + (canToggle ? 'style="cursor:pointer;" onclick="SuperAdmin.toggleFeatureConfirm(\'' + f3.id + '\', ' + (!isOn3) + ')"' : 'style="opacity:0.6;"') + '>';
        html += '<div class="admin-action-icon">' + (isOn3 ? '✅' : (canEditPro ? '🔒' : '🔐')) + '</div>';
        html += '<div class="admin-action-info">';
        html += '<div class="fw-600">' + f3.name + ' <span class="badge badge-accent">Pro</span></div>';
        html += '<div class="text-muted fs-sm">' + f3.description + '</div>';
        html += '</div>';
        html += '<div>';
        if (!canEditPro) {
          html += '<span class="badge badge-warning">ต้องมี Pro License</span>';
        } else if (isOn3) {
          html += '<span class="badge badge-success">เปิด</span>';
        } else {
          html += '<span class="badge badge-danger">ปิด</span>';
        }
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
    }
    
    /* Danger Zone */
    html += '<div class="card" style="border-color:var(--danger);">';
    html += '<div class="card-header"><div class="card-title text-danger">⚠️ Danger Zone</div></div>';
    html += '<div class="admin-actions">';
    html += '<div class="admin-action-card danger" onclick="SuperAdmin.resetFeaturesConfirm()">';
    html += '<div class="admin-action-icon">🔄</div>';
    html += '<div class="admin-action-info">';
    html += '<div class="fw-600">รีเซ็ตการตั้งค่าฟีเจอร์ทั้งหมด</div>';
    html += '<div class="text-muted fs-sm">คืนค่าฟีเจอร์ทั้งหมดเป็นค่าเริ่มต้น</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="admin-action-card danger" onclick="SuperAdmin.logout()">';
    html += '<div class="admin-action-icon">🚪</div>';
    html += '<div class="admin-action-info">';
    html += '<div class="fw-600">ออกจากระบบ Super Admin</div>';
    html += '<div class="text-muted fs-sm">กลับสู่โหมดปกติ</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    var footer = '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';
    
    openModal('👑 Super Admin', html, footer, { wide: true });
  },

  /* ============================================
     PANEL ACTIONS
     ============================================ */
  changePasswordFromModal: function() {
    var oldPass = ($('saOldPass') || {}).value;
    var newPass = ($('saNewPass') || {}).value;
    
    if (this.changePassword(oldPass, newPass)) {
      $('saOldPass').value = '';
      $('saNewPass').value = '';
      toast('เปลี่ยนรหัสผ่านเรียบร้อย', 'success');
      this.showAdminPanel();
    }
  },

  toggleFeatureConfirm: function(featureId, enabled) {
    var feature = FEATURE_REGISTRY[featureId];
    var action = enabled ? 'เปิด' : 'ปิด';
    
    confirmDialog(action + ' "' + feature.name + '" ใช่หรือไม่?', function() {
      FeatureManager.toggleFeature(featureId, enabled);
      SuperAdmin.showAdminPanel();
    });
  },

  applyPresetWithConfirm: function(presetKey) {
    var preset = FEATURE_PRESETS[presetKey];
    confirmDialog('ตั้งค่าเป็น ' + preset.name + '? (การตั้งค่าปัจจุบันจะถูกแทนที่)', function() {
      FeatureManager.applyPreset(presetKey);
      SuperAdmin.showAdminPanel();
    });
  },

  resetFeaturesConfirm: function() {
    confirmDialog('⚠️ รีเซ็ตฟีเจอร์ทั้งหมดกลับเป็นค่าเริ่มต้น?', function() {
      FeatureManager.resetToDefaults();
      SuperAdmin.showAdminPanel();
    });
  },

  logout: function() {
    this.isLoggedIn = false;
    closeMForce();
    toast('ออกจากระบบ Super Admin', 'info');
  }
};

/* Auto init */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    SuperAdmin.init();
  });
} else {
  SuperAdmin.init();
}

console.log('[super-admin.js] loaded');