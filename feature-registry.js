/* ============================================
   COFFEE POS — FEATURE REGISTRY
   จัดการ Feature Flags + Preset
   Version: 1.1 (Fixed)
   ============================================ */

/* Ensure ST exists */
if (typeof ST === 'undefined') {
  var ST = {
    getObj: function(key, fallback) { return fallback; },
    setObj: function(key, val) { console.log('[ST]', key, val); }
  };
}

var FEATURE_REGISTRY = {
  /* === CORE (เปิดเสมอ เปลี่ยนไม่ได้) === */
  core_pos: {
    id: 'core_pos',
    name: '🛒 หน้าร้าน POS',
    tier: 'core',
    canToggle: false,
    defaultValue: true,
    description: 'ระบบขายหน้าร้าน'
  },
  core_menu: {
    id: 'core_menu',
    name: '📋 จัดการเมนู',
    tier: 'core',
    canToggle: false,
    defaultValue: true,
    description: 'เพิ่ม/แก้ไข/ลบ เมนู'
  },
  core_orders: {
    id: 'core_orders',
    name: '📜 ประวัติออเดอร์',
    tier: 'core',
    canToggle: false,
    defaultValue: true,
    description: 'ดูและจัดการออเดอร์'
  },
  core_admin: {
    id: 'core_admin',
    name: '⚙️ ตั้งค่าร้าน',
    tier: 'core',
    canToggle: false,
    defaultValue: true,
    description: 'หน้าการตั้งค่าร้าน'
  },

  /* === STANDARD (เปิด/ปิดได้ ขึ้นอยู่กับ License) === */
  std_stock: {
    id: 'std_stock',
    name: '📦 Stock วัตถุดิบ',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'จัดการสต็อกวัตถุดิบ'
  },
  std_staff: {
    id: 'std_staff',
    name: '👥 ระบบพนักงาน',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'พนักงาน + PIN Login'
  },
  std_report: {
    id: 'std_report',
    name: '📊 รายงานพื้นฐาน',
    tier: 'standard',
    canToggle: false,
    defaultValue: true,
    description: 'Dashboard + รายงานยอดขาย'
  },
  std_export: {
    id: 'std_export',
    name: '📤 Export CSV',
    tier: 'standard',
    canToggle: false,
    defaultValue: true,
    description: 'ส่งออกข้อมูล CSV'
  },
  std_line: {
    id: 'std_line',
    name: '💬 LINE Notify',
    tier: 'standard',
    canToggle: true,
    defaultValue: false,
    description: 'แจ้งเตือนผ่าน LINE'
  },
  std_promptpay: {
    id: 'std_promptpay',
    name: '📷 PromptPay QR',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'QR Code พร้อมเพย์'
  },
  std_channels: {
    id: 'std_channels',
    name: '🛵 ช่องทางขาย',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'Grab, LINE MAN, Walk-in'
  },
  std_favorites: {
    id: 'std_favorites',
    name: '⭐ เมนูโปรด',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'บันทึกเมนูที่ชอบ'
  },
  std_recent: {
    id: 'std_recent',
    name: '🕐 ออเดอร์ล่าสุด',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'แสดงออเดอร์ล่าสุด'
  },
  std_sound: {
    id: 'std_sound',
    name: '🔊 เสียง',
    tier: 'standard',
    canToggle: true,
    defaultValue: true,
    description: 'เสียงแจ้งเตือน'
  },

   /* === PRO (ต้องมี Pro License) === */
  pro_members: {
    id: 'pro_members',
    name: '👤 สมาชิก + แต้มสะสม',
    tier: 'pro',
    canToggle: true,
    defaultValue: false,
    description: 'ระบบสมาชิกและแต้ม',
    requiresLicense: true
  },
  pro_recipe: {
    id: 'pro_recipe',
    name: '🧪 Recipe + COGS',
    tier: 'pro',
    canToggle: true,
    defaultValue: false,
    description: 'สูตรวัตถุดิบ + ต้นทุน',
    requiresLicense: true
  },
  pro_autostock: {
    id: 'pro_autostock',
    name: '⚡ Auto ตัด Stock',
    tier: 'pro',
    canToggle: true,
    defaultValue: false,
    description: 'หักสต็อกอัตโนมัติเมื่อขาย',
    requiresLicense: true,
    dependsOn: 'pro_recipe'
  },
  pro_kds: {
    id: 'pro_kds',
    name: '🍳 Kitchen Display',
    tier: 'pro',
    canToggle: true,
    defaultValue: false,
    description: 'จอครัวแยก',
    requiresLicense: true
  },
  pro_realtime: {
    id: 'pro_realtime',
    name: '🔄 Real-time Dashboard',
    tier: 'pro',
    canToggle: true,
    defaultValue: false,
    description: 'อัปเดตข้อมูลอัตโนมัติ',
    requiresLicense: true
  },
  pro_advanced_report: {
    id: 'pro_advanced_report',
    name: '📈 รายงานขั้นสูง',
    tier: 'pro',
    canToggle: true,
    defaultValue: false,
    description: 'COGS, กำไรสุทธิ, วิเคราะห์',
    requiresLicense: true,
    dependsOn: 'pro_recipe'
  }
};

/* === PRESETS === */
var FEATURE_PRESETS = {
  standard: {
    name: '📦 Standard',
    description: 'ฟีเจอร์พื้นฐานสำหรับร้านทั่วไป',
    icon: '📦',
    features: {
      std_stock: true,
      std_staff: true,
      std_line: false,
      std_promptpay: true,
      std_channels: true,
      std_favorites: true,
      std_recent: true,
      std_sound: true,
      // Pro features are OFF in Standard
      pro_members: false,
      pro_recipe: false,
      pro_autostock: false,
      pro_kds: false,
      pro_realtime: false,
      pro_advanced_report: false
    }
  },
  pro: {
    name: '⭐ Pro',
    description: 'ฟีเจอร์ครบทุกอย่างสำหรับร้านขนาดใหญ่',
    icon: '⭐',
    features: {
      std_stock: true,
      std_staff: true,
      std_line: true,
      std_promptpay: true,
      std_channels: true,
      std_favorites: true,
      std_recent: true,
      std_sound: true,
      // Pro features are ON
      pro_members: true,
      pro_recipe: true,
      pro_autostock: true,
      pro_kds: true,
      pro_realtime: true,
      pro_advanced_report: true
    }
  },
  custom: {
    name: '🎨 Custom',
    description: 'เลือกเองตามต้องการ',
    icon: '🎨',
    features: {}
  }
};

/* ============================================
   FEATURE MANAGER
   ============================================ */
var FeatureManager = {
  /* License tier from LicenseManager */
  getLicenseTier: function() {
    if (typeof LicenseManager !== 'undefined' && LicenseManager) {
      return LicenseManager.getTier();
    }
    return 'standard';
  },

  /* Get current feature overrides (from Super Admin) */
  getOverrides: function() {
    return ST.getObj('feature_overrides', {});
  },

  /* Save feature overrides */
  saveOverrides: function(overrides) {
    ST.setObj('feature_overrides', overrides);
  },

  /* Check if feature is enabled */
  isEnabled: function(featureId) {
    var feature = FEATURE_REGISTRY[featureId];
    if (!feature) return false;

    /* Core features always enabled */
    if (feature.tier === 'core') return true;

    /* Check license tier */
    var licenseTier = this.getLicenseTier();
    
    /* Pro features require pro license */
    if (feature.tier === 'pro' && licenseTier !== 'pro') {
      return false;
    }

    /* Check dependency */
    if (feature.dependsOn && !this.isEnabled(feature.dependsOn)) {
      return false;
    }

    /* Check override from Super Admin */
    var overrides = this.getOverrides();
    if (overrides[featureId] !== undefined) {
      return overrides[featureId];
    }

    /* Use default value */
    return feature.defaultValue;
  },

  /* Toggle feature (Super Admin only) */
  toggleFeature: function(featureId, enabled) {
    var feature = FEATURE_REGISTRY[featureId];
    if (!feature) {
      toast('ไม่พบฟีเจอร์นี้', 'error');
      return false;
    }
    
    if (!feature.canToggle) {
      toast('ไม่สามารถปิด/เปิดฟีเจอร์นี้ได้', 'error');
      return false;
    }

    /* Check if pro feature requires license */
    if (feature.tier === 'pro' && this.getLicenseTier() !== 'pro') {
      toast('⚠️ ต้องมี Pro License จึงจะเปิดฟีเจอร์นี้ได้', 'warning');
      return false;
    }

    var overrides = this.getOverrides();
    overrides[featureId] = enabled;
    this.saveOverrides(overrides);

    toast((enabled ? '✅ เปิด' : '🔒 ปิด') + ' ' + feature.name, 'success');
    
    /* Refresh UI to apply changes */
    this.applyToUI();
    
    return true;
  },

  /* Apply preset */
  applyPreset: function(presetKey) {
    var preset = FEATURE_PRESETS[presetKey];
    if (!preset) return false;

    var overrides = {};
    for (var id in preset.features) {
      if (FEATURE_REGISTRY[id] && FEATURE_REGISTRY[id].canToggle) {
        /* Only allow if license permits */
        if (FEATURE_REGISTRY[id].tier === 'pro' && this.getLicenseTier() !== 'pro') {
          continue;
        }
        overrides[id] = preset.features[id];
      }
    }
    this.saveOverrides(overrides);
    this.applyToUI();
    
    toast('ตั้งค่าเป็น ' + preset.name + ' แล้ว', 'success');
    return true;
  },

  /* Reset to defaults (clear overrides) */
  resetToDefaults: function() {
    this.saveOverrides({});
    this.applyToUI();
    toast('รีเซ็ตฟีเจอร์ทั้งหมดเป็นค่าเริ่มต้น', 'success');
  },

  /* Get all features grouped by tier */
  getAllGrouped: function() {
    var result = {
      core: [],
      standard: [],
      pro: []
    };
    var licenseTier = this.getLicenseTier();

    for (var id in FEATURE_REGISTRY) {
      var f = FEATURE_REGISTRY[id];
      var enabled = this.isEnabled(id);
      var canToggle = f.canToggle;
      
      /* Pro features without license cannot toggle */
      if (f.tier === 'pro' && licenseTier !== 'pro') {
        canToggle = false;
      }
      
      result[f.tier].push({
        id: f.id,
        name: f.name,
        description: f.description,
        canToggle: canToggle,
        enabled: enabled,
        requiresLicense: f.requiresLicense || false,
        tier: f.tier
      });
    }

    return result;
  },

  /* Apply feature toggles to UI (hide/show menu items) */
  applyToUI: function() {
    console.log('[FeatureManager] Applying toggles to UI...');
    
    /* Sidebar */
    var sideItems = qsa('.nav-item');
    for (var i = 0; i < sideItems.length; i++) {
      var view = sideItems[i].getAttribute('data-view');
      var show = this.isViewEnabled(view);
      sideItems[i].style.display = show ? '' : 'none';
    }

    /* Bottom Nav */
    var bnavItems = qsa('.bnav-item');
    for (var j = 0; j < bnavItems.length; j++) {
      var bview = bnavItems[j].getAttribute('data-view');
      var bshow = this.isViewEnabled(bview);
      bnavItems[j].style.display = bshow ? '' : 'none';
    }
    
    /* Also update admin settings visibility if needed */
    if (APP && APP.currentView === 'admin' && typeof renderAdminView === 'function') {
      renderAdminView();
    }
  },

  /* Check if a view should be visible */
  isViewEnabled: function(view) {
    var viewFeatureMap = {
      'pos': 'core_pos',
      'menu': 'core_menu',
      'orders': 'core_orders',
      'report': 'std_report',
      'stock': 'std_stock',
      'admin': 'core_admin'
    };

    var featureId = viewFeatureMap[view];
    if (!featureId) return true;
    return this.isEnabled(featureId);
  },
  
  /* Get current tier name for display */
  getCurrentTierName: function() {
    var licenseTier = this.getLicenseTier();
    if (licenseTier === 'pro') return '⭐ Pro';
    return '📦 Standard';
  }
};

console.log('[feature-registry.js] loaded');