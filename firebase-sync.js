/* ============================================
   COFFEE POS — FIREBASE-SYNC.JS
   Firebase Firestore + Google Auth + Sync
   
   ⚠️ ก่อนใช้งาน ต้อง:
   1. สร้าง Firebase Project
   2. เปิด Firestore + Auth (Google)
   3. ใส่ config ด้านล่าง
   4. เพิ่ม Firebase SDK ใน index.html
   ============================================ */

/* === FIREBASE CONFIG === */
/* 🔧 แก้ตรงนี้ — ใส่ config จาก Firebase Console */
var FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

/* === STATE === */
var _fbApp = null;
var _fbAuth = null;
var _fbDb = null;
var _fbUser = null;
var _fbSyncEnabled = false;
var _fbListeners = [];
var _fbSyncQueue = {};
var _fbSyncTimer = null;
var _fbSyncDelay = 1500;   /* Debounce sync writes */
var _fbInitialized = false;
var _fbOnline = true;

/* ============================================
   INIT FIREBASE
   ============================================ */
function initFirebase() {
  /* Check if Firebase SDK loaded */
  if (typeof firebase === 'undefined') {
    console.log('[Firebase] SDK not loaded — running offline only');
    return;
  }

  /* Check config */
  if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
    console.log('[Firebase] No config — running offline only');
    return;
  }

  try {
    /* Initialize */
    if (!firebase.apps.length) {
      _fbApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      _fbApp = firebase.apps[0];
    }

    _fbAuth = firebase.auth();
    _fbDb = firebase.firestore();

    /* Enable offline persistence */
    _fbDb.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code === 'failed-precondition') {
        console.log('[Firebase] Persistence failed: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.log('[Firebase] Persistence not supported');
      }
    });

    /* Auth state listener */
    _fbAuth.onAuthStateChanged(function(user) {
      if (user) {
        onFirebaseLogin(user);
      } else {
        onFirebaseLogout();
      }
    });

    /* Online/Offline detection */
    window.addEventListener('online', function() {
      _fbOnline = true;
      toast('🟢 กลับมาออนไลน์', 'success', 2000);
      if (_fbUser) flushSyncQueue();
    });

    window.addEventListener('offline', function() {
      _fbOnline = false;
      toast('🔴 ออฟไลน์ — ข้อมูลจะ sync เมื่อกลับมาออนไลน์', 'warning', 3000);
    });

    _fbInitialized = true;
    console.log('[Firebase] initialized');

  } catch (e) {
    console.error('[Firebase] init error:', e);
  }
}

/* ============================================
   AUTH: LOGIN / LOGOUT
   ============================================ */
function firebaseAuth() {
  if (!_fbAuth) {
    toast('Firebase ยังไม่ได้ตั้งค่า', 'warning');
    showFirebaseSetup();
    return;
  }

  if (_fbUser) {
    /* Already logged in — confirm logout */
    confirmDialog('ออกจากระบบ ' + (_fbUser.displayName || _fbUser.email) + '?', function() {
      _fbAuth.signOut();
    });
  } else {
    /* Login with Google */
    var provider = new firebase.auth.GoogleAuthProvider();
    _fbAuth.signInWithPopup(provider).catch(function(err) {
      console.error('[Firebase] auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        toast('Popup ถูกบล็อก — กรุณาอนุญาต popup', 'error');
        /* Fallback to redirect */
        _fbAuth.signInWithRedirect(provider);
      } else if (err.code === 'auth/cancelled-popup-request') {
        /* User cancelled — ignore */
      } else {
        toast('Login ไม่สำเร็จ: ' + (err.message || ''), 'error');
      }
    });
  }
}

function onFirebaseLogin(user) {
  _fbUser = user;
  _fbSyncEnabled = true;

  console.log('[Firebase] logged in:', user.email);

  /* Update UI */
  var sidebarUser = $('sidebarUser');
  if (sidebarUser) {
    sidebarUser.innerHTML = '<div class="fs-sm truncate" title="' + sanitize(user.email) + '">'
      + '🟢 ' + sanitize(user.displayName || user.email)
      + '</div>';
  }
  setText('authLabel', 'Logout');

  toast('🔐 Login: ' + (user.displayName || user.email), 'success', 2000);

  /* Start sync */
  startRealtimeSync();

  /* Initial pull from cloud */
  pullFromCloud();
}

function onFirebaseLogout() {
  _fbUser = null;
  _fbSyncEnabled = false;

  console.log('[Firebase] logged out');

  /* Stop listeners */
  stopRealtimeSync();

  /* Update UI */
  var sidebarUser = $('sidebarUser');
  if (sidebarUser) sidebarUser.innerHTML = '';
  setText('authLabel', 'Login');

  toast('🔓 ออกจากระบบแล้ว', 'info');
}

/* ============================================
   FIRESTORE PATH
   ============================================ */
function fbDocPath(key) {
  if (!_fbUser) return null;
  return 'users/' + _fbUser.uid + '/data/' + key;
}

function fbDocRef(key) {
  if (!_fbDb || !_fbUser) return null;
  return _fbDb.doc(fbDocPath(key));
}

function fbCollRef() {
  if (!_fbDb || !_fbUser) return null;
  return _fbDb.collection('users').doc(_fbUser.uid).collection('data');
}

/* ============================================
   PUSH TO CLOUD (Write)
   ============================================ */
function pushToCloud(key, value) {
  if (!_fbSyncEnabled || !_fbDb || !_fbUser) return;

  var ref = fbDocRef(key);
  if (!ref) return;

  var data = {
    value: value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: _fbUser.uid
  };

  ref.set(data, { merge: true }).then(function() {
    console.log('[Firebase] pushed:', key);
  }).catch(function(err) {
    console.error('[Firebase] push error:', key, err);
    /* Queue for retry */
    _fbSyncQueue[key] = value;
  });
}

/* Debounced push (batch writes) */
function queuePush(key, value) {
  _fbSyncQueue[key] = value;

  if (_fbSyncTimer) clearTimeout(_fbSyncTimer);
  _fbSyncTimer = setTimeout(function() {
    flushSyncQueue();
  }, _fbSyncDelay);
}

function flushSyncQueue() {
  if (!_fbSyncEnabled || !_fbDb || !_fbUser) return;

  var keys = Object.keys(_fbSyncQueue);
  if (keys.length === 0) return;

  var batch = _fbDb.batch();
  var count = 0;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var ref = fbDocRef(key);
    if (!ref) continue;

    batch.set(ref, {
      value: _fbSyncQueue[key],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _fbUser.uid
    }, { merge: true });

    count++;
  }

  if (count === 0) return;

  /* Clear queue before writing */
  _fbSyncQueue = {};

  batch.commit().then(function() {
    console.log('[Firebase] batch pushed:', count, 'keys');
  }).catch(function(err) {
    console.error('[Firebase] batch error:', err);
    /* Re-queue failed items */
    for (var j = 0; j < keys.length; j++) {
      _fbSyncQueue[keys[j]] = ST.get(keys[j]);
    }
  });
}

/* ============================================
   PULL FROM CLOUD (Read)
   ============================================ */
function pullFromCloud() {
  if (!_fbSyncEnabled || !_fbDb || !_fbUser) return;

  var coll = fbCollRef();
  if (!coll) return;

  toast('☁️ กำลัง sync...', 'info', 2000);

  coll.get().then(function(snapshot) {
    var pulled = 0;

    snapshot.forEach(function(doc) {
      var key = doc.id;
      var data = doc.data();

      /* Only sync known keys */
      if (ST._keys.indexOf(key) === -1) return;

      if (data && data.value !== undefined) {
        /* Compare timestamps to resolve conflicts */
        var cloudValue = data.value;
        var localValue = ST.get(key);

        /* If cloud has data and local is empty → use cloud */
        /* If both have data → use cloud (cloud wins) */
        if (cloudValue !== null && cloudValue !== undefined) {
          /* Temporarily disable sync hook to prevent loop */
          var origHook = ST._onSet;
          ST._onSet = null;
          ST.set(key, cloudValue);
          ST._onSet = origHook;
          pulled++;
        }
      }
    });

    if (pulled > 0) {
      console.log('[Firebase] pulled:', pulled, 'keys');
      toast('☁️ Sync สำเร็จ (' + pulled + ' รายการ)', 'success', 2000);

      /* Refresh current view */
      applyShopName();
      applyTheme();
      if (typeof renderView === 'function') {
        renderView(APP.currentView);
      }
    } else {
      toast('☁️ ข้อมูลเป็นปัจจุบัน', 'info', 1500);
    }

  }).catch(function(err) {
    console.error('[Firebase] pull error:', err);
    toast('Sync ไม่สำเร็จ', 'error');
  });
}

/* ============================================
   REAL-TIME SYNC (Listeners)
   ============================================ */
function startRealtimeSync() {
  if (!_fbSyncEnabled || !_fbDb || !_fbUser) return;

  /* Stop existing listeners */
  stopRealtimeSync();

  var coll = fbCollRef();
  if (!coll) return;

  /* Listen to all docs in user's data collection */
  var unsubscribe = coll.onSnapshot(function(snapshot) {
    var changes = [];

    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'modified' || change.type === 'added') {
        var key = change.doc.id;
        var data = change.doc.data();

        /* Only sync known keys */
        if (ST._keys.indexOf(key) === -1) return;

        /* Check if change came from this device */
        if (data.updatedBy === _fbUser.uid) {
          /* Could be our own write — check if value differs */
          var localValue = ST.get(key);
          if (localValue === data.value) return;
        }

        if (data.value !== undefined) {
          /* Apply without triggering sync hook */
          var origHook = ST._onSet;
          ST._onSet = null;
          ST.set(key, data.value);
          ST._onSet = origHook;
          changes.push(key);
        }
      }
    });

    if (changes.length > 0) {
      console.log('[Firebase] realtime update:', changes);

      /* Refresh view if relevant data changed */
      var needRefresh = false;
      for (var i = 0; i < changes.length; i++) {
        if (changes[i] === 'config') {
          applyShopName();
          applyTheme();
        }
        if (['menu', 'categories', 'toppings', 'sizes', 'orders', 'stock'].indexOf(changes[i]) !== -1) {
          needRefresh = true;
        }
      }

      if (needRefresh && typeof renderView === 'function') {
        renderView(APP.currentView);
        toast('☁️ ข้อมูลอัพเดตจากเครื่องอื่น', 'info', 2000);
      }
    }

  }, function(err) {
    console.error('[Firebase] realtime error:', err);
  });

  _fbListeners.push(unsubscribe);
  console.log('[Firebase] realtime sync started');
}

function stopRealtimeSync() {
  for (var i = 0; i < _fbListeners.length; i++) {
    if (typeof _fbListeners[i] === 'function') {
      _fbListeners[i]();
    }
  }
  _fbListeners = [];
  console.log('[Firebase] realtime sync stopped');
}

/* ============================================
   ST._onSet HOOK
   Auto-push to cloud when localStorage changes
   ============================================ */
function setupSyncHook() {
  ST._onSet = function(key, value) {
    if (!_fbSyncEnabled) return;

    /* Only sync known keys */
    if (ST._keys.indexOf(key) === -1) return;

    /* Queue for batch push */
    queuePush(key, value);
  };
}

/* ============================================
   MANUAL SYNC BUTTON
   ============================================ */
function firebaseSync() {
  if (!_fbInitialized) {
    toast('Firebase ยังไม่ได้ตั้งค่า', 'warning');
    showFirebaseSetup();
    return;
  }

  if (!_fbUser) {
    toast('กรุณา Login ก่อน', 'warning');
    firebaseAuth();
    return;
  }

  /* Force push all data to cloud */
  var pushHTML = '';
  pushHTML += '<div class="text-center mb-16">';
  pushHTML += '<div style="font-size:48px;margin-bottom:8px;">☁️</div>';
  pushHTML += '<div class="fw-700 fs-lg mb-4">Cloud Sync</div>';
  pushHTML += '<div class="text-muted fs-sm">เชื่อมต่อ: ' + sanitize(_fbUser.displayName || _fbUser.email) + '</div>';
  pushHTML += '<div class="text-muted fs-sm">สถานะ: ' + (_fbOnline ? '🟢 ออนไลน์' : '🔴 ออฟไลน์') + '</div>';
  pushHTML += '</div>';

  var footer = '';
  footer += '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';
  footer += '<button class="btn btn-info" onclick="closeMForce(); pullFromCloud();">📥 ดึงจาก Cloud</button>';
  footer += '<button class="btn btn-primary" onclick="closeMForce(); pushAllToCloud();">📤 ส่งขึ้น Cloud</button>';

  openModal('☁️ Cloud Sync', pushHTML, footer);
}

function pushAllToCloud() {
  if (!_fbSyncEnabled || !_fbDb || !_fbUser) {
    toast('ไม่สามารถ sync ได้', 'error');
    return;
  }

  toast('📤 กำลังส่งข้อมูลขึ้น Cloud...', 'info', 2000);

  var batch = _fbDb.batch();
  var count = 0;

  for (var i = 0; i < ST._keys.length; i++) {
    var key = ST._keys[i];
    var value = ST.get(key);
    if (value === null) continue;

    var ref = fbDocRef(key);
    if (!ref) continue;

    batch.set(ref, {
      value: value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _fbUser.uid
    }, { merge: true });

    count++;
  }

  if (count === 0) {
    toast('ไม่มีข้อมูลให้ sync', 'info');
    return;
  }

  batch.commit().then(function() {
    toast('📤 ส่งข้อมูลสำเร็จ (' + count + ' รายการ)', 'success');
  }).catch(function(err) {
    console.error('[Firebase] push all error:', err);
    toast('ส่งข้อมูลไม่สำเร็จ', 'error');
  });
}

/* ============================================
   FIREBASE SETUP GUIDE
   ============================================ */
function showFirebaseSetup() {
  var html = '';
  html += '<div class="mb-16">';
  html += '<div class="fw-700 mb-8">📋 วิธีตั้งค่า Firebase</div>';
  html += '<div class="text-muted fs-sm" style="line-height:1.8;">';
  html += '1. ไปที่ <a href="https://console.firebase.google.com" target="_blank">Firebase Console</a><br>';
  html += '2. สร้าง Project ใหม่<br>';
  html += '3. เปิด Authentication → Sign-in method → Google<br>';
  html += '4. เปิด Firestore Database → Create<br>';
  html += '5. ไปที่ Project Settings → General → Your apps<br>';
  html += '6. เพิ่ม Web App → Copy firebaseConfig<br>';
  html += '7. แก้ไขค่าใน firebase-sync.js → FIREBASE_CONFIG<br>';
  html += '8. เพิ่ม Firebase SDK ใน index.html';
  html += '</div>';
  html += '</div>';

  html += '<div class="card p-16 mb-16" style="background:var(--bg-input);">';
  html += '<div class="fw-600 fs-sm mb-8">เพิ่มใน index.html (ก่อน utils.js)</div>';
  html += '<div class="fs-sm text-muted" style="font-family:monospace;white-space:pre-wrap;word-break:break-all;">';
  html += sanitize('<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>') + '\n';
  html += sanitize('<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>') + '\n';
  html += sanitize('<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>');
  html += '</div>';
  html += '</div>';

  html += '<div class="card p-16" style="background:var(--bg-input);">';
  html += '<div class="fw-600 fs-sm mb-8">Firestore Rules (แนะนำ)</div>';
  html += '<div class="fs-sm text-muted" style="font-family:monospace;white-space:pre-wrap;">';
  html += 'rules_version = \'2\';\n';
  html += 'service cloud.firestore {\n';
  html += '  match /databases/{database}/documents {\n';
  html += '    match /users/{userId}/{document=**} {\n';
  html += '      allow read, write: if request.auth != null\n';
  html += '                         && request.auth.uid == userId;\n';
  html += '    }\n';
  html += '  }\n';
  html += '}';
  html += '</div>';
  html += '</div>';

  var footer = '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';

  openModal('🔧 ตั้งค่า Firebase', html, footer);
}

/* ============================================
   FIRESTORE SECURITY CHECK
   ============================================ */
function checkFirestoreAccess() {
  if (!_fbDb || !_fbUser) return;

  /* Test write */
  var testRef = _fbDb.doc('users/' + _fbUser.uid + '/data/_test');
  testRef.set({
    value: 'test',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    /* Clean up test doc */
    testRef.delete();
    console.log('[Firebase] Firestore access OK');
  }).catch(function(err) {
    console.error('[Firebase] Firestore access denied:', err);
    toast('⚠️ Firestore access denied — ตรวจสอบ Rules', 'error', 5000);
  });
}

/* ============================================
   SYNC STATUS UI
   ============================================ */
function getSyncStatus() {
  if (!_fbInitialized) return { status: 'none', label: 'ไม่ได้ตั้งค่า', color: 'var(--text-muted)' };
  if (!_fbUser) return { status: 'logout', label: 'ยังไม่ Login', color: 'var(--warning)' };
  if (!_fbOnline) return { status: 'offline', label: 'ออฟไลน์', color: 'var(--danger)' };

  var queueLen = Object.keys(_fbSyncQueue).length;
  if (queueLen > 0) return { status: 'syncing', label: 'กำลัง sync (' + queueLen + ')', color: 'var(--warning)' };

  return { status: 'synced', label: 'Synced', color: 'var(--success)' };
}

/* ============================================
   CONFLICT RESOLUTION
   ============================================ */

/*
  Strategy: Last-Write-Wins (LWW)
  
  - Cloud data has `updatedAt` server timestamp
  - When pulling: cloud wins (overwrites local)
  - When realtime update comes: cloud wins
  - Local changes push to cloud with debounce
  
  For orders (append-only):
  - Both local and cloud can add orders
  - On pull: merge by ID (union of both sets)
*/

function mergeOrders(localOrders, cloudOrders) {
  if (!cloudOrders || !Array.isArray(cloudOrders)) return localOrders;
  if (!localOrders || !Array.isArray(localOrders)) return cloudOrders;

  var map = {};

  /* Local first */
  for (var i = 0; i < localOrders.length; i++) {
    map[localOrders[i].id] = localOrders[i];
  }

  /* Cloud overwrites/adds */
  for (var j = 0; j < cloudOrders.length; j++) {
    var co = cloudOrders[j];
    if (!map[co.id]) {
      /* New from cloud */
      map[co.id] = co;
    } else {
      /* Exists — keep cloud version (newer timestamp) */
      if ((co.timestamp || 0) >= (map[co.id].timestamp || 0)) {
        map[co.id] = co;
      }
    }
  }

  var result = [];
  for (var k in map) {
    result.push(map[k]);
  }

  /* Sort by timestamp */
  result.sort(function(a, b) {
    return (a.timestamp || 0) - (b.timestamp || 0);
  });

  return result;
}

/* ============================================
   AUTO-INIT
   ============================================ */
(function() {
  /* Init Firebase when DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        initFirebase();
        setupSyncHook();
      }, 500);
    });
  } else {
    setTimeout(function() {
      initFirebase();
      setupSyncHook();
    }, 500);
  }
})();

console.log('[firebase-sync.js] loaded');