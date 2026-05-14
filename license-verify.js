/* ============================================
   COFFEE POS — LICENSE VERIFICATION
   รูปแบบ: PRO-XXXX-XXXX (Simple)
   Version: 1.0
   ============================================ */
/* Ensure ST exists */
if (typeof ST === 'undefined') {
  var ST = {
    getObj: function(key, fallback) { return fallback; },
    setObj: function(key, val) { console.log('[ST]', key, val); }
  };
}

var LicenseManager = {
  currentKey: null,
  tier: 'standard', /* standard / pro / trial */
  trialExpiry: null,
  
  /* License patterns */
  patterns: {
    pro: /^PRO-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    trial: /^TRIAL-[A-Z0-9]{6}$/
  },
  
  /* ============================================
     INIT
     ============================================ */
  init: function() {
    var saved = ST.getObj('license', null);
    if (saved) {
      this.currentKey = saved.key;
      this.tier = saved.tier;
      this.trialExpiry = saved.trialExpiry || null;
      
      /* Check trial expiry */
      if (this.tier === 'trial' && this.trialExpiry) {
        if (Date.now() > this.trialExpiry) {
          this.tier = 'standard';
          this.currentKey = null;
          ST.setObj('license', null);
          toast('⚠️ สิ้นสุดระยะเวลาทดลอง使用แล้ว', 'warning');
        }
      }
    }
  },
  
  /* ============================================
     VALIDATE LICENSE KEY
     ============================================ */
  validate: function(key) {
    var cleanKey = key.trim().toUpperCase();
    
    /* Check Pro pattern */
    if (this.patterns.pro.test(cleanKey)) {
      this.currentKey = cleanKey;
      this.tier = 'pro';
      this.trialExpiry = null;
      
      ST.setObj('license', {
        key: cleanKey,
        tier: 'pro',
        activatedAt: Date.now()
      });
      
      return { valid: true, tier: 'pro' };
    }
    
    /* Check Trial pattern */
    if (this.patterns.trial.test(cleanKey)) {
      var expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); /* 30 days */
      
      this.currentKey = cleanKey;
      this.tier = 'trial';
      this.trialExpiry = expiry;
      
      ST.setObj('license', {
        key: cleanKey,
        tier: 'trial',
        trialExpiry: expiry,
        activatedAt: Date.now()
      });
      
      var daysLeft = 30;
      toast('🎉 ทดลองใช้ 30 วัน เหลือ ' + daysLeft + ' วัน', 'success');
      
      return { valid: true, tier: 'trial', daysLeft: 30 };
    }
    
    return { valid: false, error: 'รูปแบบ License ไม่ถูกต้อง' };
  },
  
  /* ============================================
     GENERATE DEMO KEY (for testing)
     ============================================ */
  generateDemoKey: function() {
    var parts = [];
    for (var i = 0; i < 2; i++) {
      var part = '';
      for (var j = 0; j < 4; j++) {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        part += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      parts.push(part);
    }
    return 'PRO-' + parts.join('-');
  },
  
  /* ============================================
     GET CURRENT TIER
     ============================================ */
  getTier: function() {
    return this.tier;
  },
  
  getCurrentKey: function() {
    return this.currentKey;
  },
  
  isPro: function() {
    return this.tier === 'pro';
  },
  
  isTrial: function() {
    return this.tier === 'trial';
  },
  
  /* ============================================
     GET TRIAL DAYS LEFT
     ============================================ */
  getTrialDaysLeft: function() {
    if (this.tier !== 'trial' || !this.trialExpiry) return 0;
    var diff = this.trialExpiry - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },
  
  /* ============================================
     SHOW LICENSE MODAL
     ============================================ */
  showLicenseModal: function() {
    var html = '';
    var daysLeft = this.getTrialDaysLeft();
    
    html += '<div class="text-center mb-16">';
    html += '<div style="font-size:48px;">🔑</div>';
    html += '<div class="fw-800 fs-xl mb-2">License</div>';
    html += '<div class="text-muted fs-sm">สถานะ: ';
    if (this.tier === 'pro') {
      html += '<span class="badge badge-success">⭐ Pro</span>';
    } else if (this.tier === 'trial') {
      html += '<span class="badge badge-warning">🧪 ทดลองใช้ (เหลือ ' + daysLeft + ' วัน)</span>';
    } else {
      html += '<span class="badge badge-info">📦 Standard (ฟรี)</span>';
    }
    html += '</div>';
    if (this.currentKey) {
      html += '<div class="text-muted fs-sm mt-4">Key: ' + this.currentKey + '</div>';
    }
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label class="form-label">License Key</label>';
    html += '<input type="text" id="licenseKey" placeholder="PRO-XXXX-XXXX" style="font-family:monospace;text-align:center;letter-spacing:2px;">';
    html += '<div class="form-hint">รูปแบบ: PRO-ABCD-1234 หรือ TRIAL-XXXXXX (ทดลอง 30 วัน)</div>';
    html += '</div>';
    
    html += '<div class="flex gap-8 flex-wrap">';
    html += '<button class="btn btn-secondary btn-sm" onclick="LicenseManager.pasteDemoKey()">📋 วาง Demo Key</button>';
    html += '<button class="btn btn-info btn-sm" onclick="LicenseManager.generateAndPaste()">🎲 สุ่ม Key ทดสอบ</button>';
    html += '</div>';
    
    var footer = '';
    footer += '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';
    footer += '<button class="btn btn-primary" onclick="LicenseManager.activateFromModal()">🔓 เปิดใช้งาน</button>';
    
    openModal('🔑 ลงทะเบียน License', html, footer);
  },
  
  activateFromModal: function() {
    var keyEl = $('licenseKey');
    if (!keyEl) return;
    
    var key = keyEl.value.trim();
    if (!key) {
      toast('กรุณาใส่ License Key', 'error');
      return;
    }
    
    var result = this.validate(key);
    if (result.valid) {
      closeMForce();
      toast('✅ เปิดใช้งาน ' + result.tier.toUpperCase() + ' สำเร็จ!', 'success');
      
      /* Refresh UI */
      if (typeof applyFeatureToggle === 'function') applyFeatureToggle();
      if (APP.currentView === 'admin' && typeof renderAdminView === 'function') renderAdminView();
    } else {
      toast('❌ ' + result.error, 'error');
    }
  },
  
  pasteDemoKey: function() {
    var keyEl = $('licenseKey');
    if (keyEl) {
      /* Demo key for testing */
      keyEl.value = 'PRO-DEMO-0000';
      toast('วาง Demo Key แล้ว (ใช้เพื่อทดสอบ)', 'info');
    }
  },
  
  generateAndPaste: function() {
    var keyEl = $('licenseKey');
    if (keyEl) {
      keyEl.value = this.generateDemoKey();
      toast('สุ่ม Key ทดสอบเรียบร้อย', 'success');
    }
  }
};

/* Auto init */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    LicenseManager.init();
  });
} else {
  LicenseManager.init();
}

console.log('[license-verify.js] loaded');