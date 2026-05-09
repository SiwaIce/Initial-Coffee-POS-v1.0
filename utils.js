/* ============================================
   COFFEE POS — UTILS.JS
   Helper functions
   ============================================ */

/* === SANITIZE (XSS Prevention) === */
function sanitize(str) {
  if (str === null || str === undefined) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

/* === GENERATE ID === */
function genId(prefix) {
  var p = prefix || 'id';
  return p + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

/* === DATE HELPERS === */
function todayStr() {
  return formatDate(new Date());
}

function nowTimeStr() {
  var d = new Date();
  var hh = padZ(d.getHours());
  var mm = padZ(d.getMinutes());
  return hh + ':' + mm;
}

function nowTimestamp() {
  return Date.now();
}

function padZ(n) {
  return n < 10 ? '0' + n : '' + n;
}

/* DD/MM/YYYY */
function formatDate(d) {
  if (!d) return '';
  if (typeof d === 'string') d = parseDate(d);
  if (!d || isNaN(d.getTime())) return '';
  return padZ(d.getDate()) + '/' + padZ(d.getMonth() + 1) + '/' + d.getFullYear();
}

/* Parse DD/MM/YYYY → Date */
function parseDate(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  var parts = String(str).split('/');
  if (parts.length !== 3) return null;
  var dd = parseInt(parts[0], 10);
  var mm = parseInt(parts[1], 10) - 1;
  var yyyy = parseInt(parts[2], 10);
  if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return null;
  return new Date(yyyy, mm, dd);
}

/* Parse DD/MM/YYYY HH:MM → Date */
function parseDateTime(dateStr, timeStr) {
  var d = parseDate(dateStr);
  if (!d) return null;
  if (timeStr) {
    var tp = String(timeStr).split(':');
    d.setHours(parseInt(tp[0], 10) || 0);
    d.setMinutes(parseInt(tp[1], 10) || 0);
  }
  return d;
}

/* Is same day */
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/* Get start of day */
function startOfDay(d) {
  var r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/* Get end of day */
function endOfDay(d) {
  var r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

/* Get start of week (Monday) */
function startOfWeek(d) {
  var r = new Date(d);
  var day = r.getDay();
  var diff = day === 0 ? 6 : day - 1;
  r.setDate(r.getDate() - diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

/* Get start of month */
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/* Get end of month */
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/* Days between */
function daysBetween(d1, d2) {
  var ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(ms / 86400000);
}

/* Format relative: วันนี้, เมื่อวาน, 3 วันก่อน */
function relativeDay(dateStr) {
  var d = parseDate(dateStr);
  if (!d) return dateStr;
  var today = startOfDay(new Date());
  var target = startOfDay(d);
  var diff = Math.floor((today.getTime() - target.getTime()) / 86400000);
  if (diff === 0) return 'วันนี้';
  if (diff === 1) return 'เมื่อวาน';
  if (diff < 7) return diff + ' วันก่อน';
  return dateStr;
}

/* === MONEY FORMAT === */
function formatMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  var num = parseFloat(n);
  if (num === Math.floor(num)) {
    return num.toLocaleString('th-TH');
  }
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatMoneySign(n) {
  return '\u0E3F' + formatMoney(n);
}

/* Parse money string → number */
function parseMoney(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  var cleaned = String(str).replace(/[^\d.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

/* === TOAST === */
var _toastTimer = null;

function toast(msg, type, duration) {
  var t = type || 'info';
  var dur = duration || 3000;
  var container = document.getElementById('toastContainer');
  if (!container) return;

  var icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  var el = document.createElement('div');
  el.className = 'toast ' + t;
  el.innerHTML = '<span>' + (icons[t] || 'ℹ️') + '</span><span>' + sanitize(msg) + '</span>';
  container.appendChild(el);

  var timer = setTimeout(function() {
    el.className = el.className + ' hide';
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 350);
  }, dur);

  el.onclick = function() {
    clearTimeout(timer);
    el.className = el.className + ' hide';
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 350);
  };
}

/* === DEBOUNCE === */
function debounce(fn, delay) {
  var timer = null;
  return function() {
    var ctx = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(ctx, args);
    }, delay || 300);
  };
}

/* === THROTTLE === */
function throttle(fn, limit) {
  var last = 0;
  return function() {
    var now = Date.now();
    if (now - last >= (limit || 300)) {
      last = now;
      fn.apply(this, arguments);
    }
  };
}

/* === DEEP CLONE === */
function cloneObj(obj) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

/* === ARRAY HELPERS === */
function sortBy(arr, key, desc) {
  var d = desc ? -1 : 1;
  return arr.slice().sort(function(a, b) {
    var va = a[key];
    var vb = b[key];
    if (va < vb) return -1 * d;
    if (va > vb) return 1 * d;
    return 0;
  });
}

function groupBy(arr, key) {
  var result = {};
  for (var i = 0; i < arr.length; i++) {
    var k = arr[i][key] || '_none';
    if (!result[k]) result[k] = [];
    result[k].push(arr[i]);
  }
  return result;
}

function sumBy(arr, key) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total += (parseFloat(arr[i][key]) || 0);
  }
  return total;
}

function findById(arr, id) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return arr[i];
  }
  return null;
}

function findIndexById(arr, id) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return i;
  }
  return -1;
}

function removeById(arr, id) {
  var idx = findIndexById(arr, id);
  if (idx !== -1) arr.splice(idx, 1);
  return arr;
}

function countBy(arr, key, val) {
  var c = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) c++;
  }
  return c;
}

function uniqueVals(arr, key) {
  var seen = {};
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i][key];
    if (v !== undefined && !seen[v]) {
      seen[v] = true;
      result.push(v);
    }
  }
  return result;
}

/* === STRING HELPERS === */
function truncateStr(str, maxLen) {
  if (!str) return '';
  var m = maxLen || 30;
  if (str.length <= m) return str;
  return str.substring(0, m) + '...';
}

function searchMatch(text, query) {
  if (!query) return true;
  var t = String(text).toLowerCase();
  var q = String(query).toLowerCase().trim();
  return t.indexOf(q) !== -1;
}

/* === NUMBER HELPERS === */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function roundTo(num, decimals) {
  var d = decimals || 0;
  var f = Math.pow(10, d);
  return Math.round(num * f) / f;
}

function pct(part, total) {
  if (!total) return 0;
  return roundTo((part / total) * 100, 1);
}

/* === DOM HELPERS === */
function $(id) {
  return document.getElementById(id);
}

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return document.querySelectorAll(sel);
}

function setHTML(id, html) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setText(id, txt) {
  var el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function addClass(el, cls) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (el) el.classList.add(cls);
}

function removeClass(el, cls) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (el) el.classList.remove(cls);
}

function toggleClass(el, cls) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (el) el.classList.toggle(cls);
}

function hasClass(el, cls) {
  if (typeof el === 'string') el = document.getElementById(el);
  return el ? el.classList.contains(cls) : false;
}

function showEl(id) {
  var el = typeof id === 'string' ? document.getElementById(id) : id;
  if (el) el.style.display = '';
}

function hideEl(id) {
  var el = typeof id === 'string' ? document.getElementById(id) : id;
  if (el) el.style.display = 'none';
}

/* === CREATE ELEMENT HELPER === */
function createEl(tag, attrs, children) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var key in attrs) {
      if (key === 'className') {
        el.className = attrs[key];
      } else if (key === 'innerHTML') {
        el.innerHTML = attrs[key];
      } else if (key === 'onclick' || key === 'onchange' || key === 'oninput') {
        el[key] = attrs[key];
      } else if (key === 'style' && typeof attrs[key] === 'object') {
        for (var s in attrs[key]) {
          el.style[s] = attrs[key][s];
        }
      } else {
        el.setAttribute(key, attrs[key]);
      }
    }
  }
  if (children) {
    if (typeof children === 'string') {
      el.innerHTML = children;
    } else if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        if (children[i]) el.appendChild(children[i]);
      }
    }
  }
  return el;
}

/* === SELECT / DROPDOWN OPTIONS === */
function optionsHTML(items, valKey, labelKey, selectedVal) {
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var v = items[i][valKey];
    var l = items[i][labelKey];
    var sel = (v === selectedVal) ? ' selected' : '';
    html += '<option value="' + sanitize(v) + '"' + sel + '>' + sanitize(l) + '</option>';
  }
  return html;
}

/* === CONFIRM DIALOG (simple) === */
function confirmDialog(msg, onYes) {
  if (confirm(msg)) {
    if (typeof onYes === 'function') onYes();
  }
}

/* === COPY TO CLIPBOARD === */
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      toast('คัดลอกแล้ว', 'success');
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast('คัดลอกแล้ว', 'success');
  } catch (e) {
    toast('คัดลอกไม่สำเร็จ', 'error');
  }
  document.body.removeChild(ta);
}

/* === DOWNLOAD FILE === */
function downloadFile(filename, content, mimeType) {
  var mime = mimeType || 'text/plain';
  var blob = new Blob([content], { type: mime + ';charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast('ดาวน์โหลด ' + filename, 'success');
}

/* === CLOCK UPDATE === */
function updateClock() {
  var el = document.getElementById('topClock');
  if (!el) return;
  var now = new Date();
  var hh = padZ(now.getHours());
  var mm = padZ(now.getMinutes());
  var ss = padZ(now.getSeconds());
  el.textContent = hh + ':' + mm + ':' + ss;
}

/* === NUMBER ORDER (Today reset) === */
function getNextOrderNumber(orders) {
  var today = todayStr();
  var todayOrders = [];
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].date === today && orders[i].status !== 'cancelled') {
      todayOrders.push(orders[i]);
    }
  }
  var maxNum = 0;
  for (var j = 0; j < todayOrders.length; j++) {
    var n = todayOrders[j].number || 0;
    if (n > maxNum) maxNum = n;
  }
  return maxNum + 1;
}

/* === EMOJI MAP FOR CATEGORIES === */
var CAT_EMOJIS = {
  coffee: '☕',
  tea: '🍵',
  blend: '🧋',
  cake: '🍰',
  drink: '🥤',
  bakery: '🧁',
  food: '🍕',
  other: '📦'
};

/* === VIBRATE (Mobile feedback) === */
function vibrate(ms) {
  if (navigator.vibrate) {
    navigator.vibrate(ms || 30);
  }
}

/* === FORMAT FILE SIZE === */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

/* === IMAGE TO BASE64 (for menu photos) === */
function imageToBase64(file, maxSize, callback) {
  var max = maxSize || 200;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var w = img.width;
      var h = img.height;
      if (w > h) {
        if (w > max) { h = h * (max / w); w = max; }
      } else {
        if (h > max) { w = w * (max / h); h = max; }
      }
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      var b64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(b64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* === PRINT RECEIPT === */
function printReceipt(html) {
  var el = document.getElementById('receiptPrint');
  if (!el) return;
  el.innerHTML = html;
  setTimeout(function() {
    window.print();
  }, 200);
}

console.log('[utils.js] loaded');