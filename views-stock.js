/* ============================================
   COFFEE POS — VIEWS-STOCK.JS
   จัดการวัตถุดิบ / Stock
   ============================================ */

/* === STOCK VIEW STATE === */
var STKVIEW = {
  tab: 'stock',          /* 'stock' | 'logs' */
  searchQuery: '',
  filterStatus: 'all',   /* 'all' | 'low' | 'ok' */
  logSearch: '',
  logPage: 1,
  logPerPage: 30
};

/* ============================================
   RENDER STOCK VIEW
   ============================================ */
function renderStockView() {
  var main = $('mainContent');
  if (!main) return;

  var html = '';
  html += '<div class="page-pad anim-fadeUp">';

  /* Header */
  html += '<div class="section-header">';
  html += '<div class="section-title">📦 จัดการ Stock</div>';
  html += '<div class="section-tools">';
  html += '<button class="btn btn-primary btn-sm" onclick="modalEditStock(null)">➕ เพิ่มวัตถุดิบ</button>';
  html += '</div>';
  html += '</div>';

  /* Low stock alert */
  html += renderStockAlerts();

  /* Sub-tabs */
  html += '<div class="cat-tabs mb-16">';
  html += stkSubTab('stock', '📦 วัตถุดิบ');
  html += stkSubTab('logs', '📋 ประวัติ');
  html += '</div>';

  /* Content */
  html += '<div id="stkContent">';
  html += renderStockContent();
  html += '</div>';

  html += '</div>';
  main.innerHTML = html;
}

function stkSubTab(key, label) {
  var active = STKVIEW.tab === key ? ' active' : '';
  return '<button class="cat-tab' + active + '" onclick="switchStkTab(\'' + key + '\')">' + label + '</button>';
}

function switchStkTab(tab) {
  STKVIEW.tab = tab;
  vibrate(20);
  setHTML('stkContent', renderStockContent());

  /* Update tabs */
  var tabs = qsa('.cat-tabs .cat-tab');
  for (var i = 0; i < tabs.length; i++) {
    var onclick = tabs[i].getAttribute('onclick') || '';
    if (onclick.indexOf("'" + tab + "'") !== -1) {
      addClass(tabs[i], 'active');
    } else {
      removeClass(tabs[i], 'active');
    }
  }
}

function renderStockContent() {
  switch (STKVIEW.tab) {
    case 'stock': return renderStockList();
    case 'logs': return renderStockLogs();
    default: return '';
  }
}

/* ============================================
   LOW STOCK ALERTS
   ============================================ */
function renderStockAlerts() {
  var low = ST.getLowStock();
  if (low.length === 0) return '';

  var html = '<div class="stock-alert-card mb-16 anim-fadeUp">';
  html += '<div class="flex-between mb-8">';
  html += '<div class="fw-700 text-danger">⚠️ วัตถุดิบใกล้หมด (' + low.length + ' รายการ)</div>';
  html += '</div>';

  html += '<div class="stock-alert-items">';
  for (var i = 0; i < low.length; i++) {
    var s = low[i];
    var pctLeft = s.minQty > 0 ? roundTo((s.qty / s.minQty) * 100, 0) : 0;
    var isZero = s.qty <= 0;

    html += '<div class="stock-alert-item' + (isZero ? ' zero' : '') + '">';
    html += '<div class="flex gap-8" style="align-items:center;">';
    html += '<span style="font-size:20px;">' + (isZero ? '🔴' : '🟡') + '</span>';
    html += '<div>';
    html += '<div class="fw-600">' + sanitize(s.name) + '</div>';
    html += '<div class="fs-sm text-muted">เหลือ ' + formatMoney(s.qty) + ' ' + sanitize(s.unit) + ' (ขั้นต่ำ ' + formatMoney(s.minQty) + ')</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="flex gap-8">';
    html += '<button class="btn btn-success btn-sm" onclick="quickStockAdd(\'' + sanitize(s.id) + '\')">📥 รับเข้า</button>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  html += '</div>';
  return html;
}

function quickStockAdd(stockId) {
  var items = ST.getStock();
  var item = findById(items, stockId);
  if (item) modalStockAdjust(item, 'add');
}

/* ============================================
   TAB: STOCK LIST
   ============================================ */
function renderStockList() {
  var allItems = ST.getStock();
  var low = ST.getLowStock();

  var html = '';

  /* Toolbar */
  html += '<div class="flex-between mb-16" style="flex-wrap:wrap;gap:12px;">';

  /* Search */
  html += '<div class="pos-search" style="flex:1;min-width:200px;max-width:400px;">';
  html += '<span class="pos-search-icon">🔍</span>';
  html += '<input type="text" id="stkSearch" placeholder="ค้นหาวัตถุดิบ..." value="' + sanitize(STKVIEW.searchQuery) + '" oninput="stkSearch(this.value)">';
  html += '</div>';

  /* Filter */
  html += '<div class="flex gap-8">';
  html += '<select id="stkFilter" onchange="stkFilterChange(this.value)" style="width:auto;">';
  html += '<option value="all"' + (STKVIEW.filterStatus === 'all' ? ' selected' : '') + '>ทั้งหมด (' + allItems.length + ')</option>';
  html += '<option value="low"' + (STKVIEW.filterStatus === 'low' ? ' selected' : '') + '>⚠️ ใกล้หมด (' + low.length + ')</option>';
  html += '<option value="ok"' + (STKVIEW.filterStatus === 'ok' ? ' selected' : '') + '>✅ ปกติ (' + (allItems.length - low.length) + ')</option>';
  html += '</select>';
  html += '<button class="btn btn-primary btn-sm" onclick="modalEditStock(null)">➕ เพิ่ม</button>';
  html += '</div>';

  html += '</div>';

  /* Get filtered items */
  var items = filterStockItems(allItems, low);

  if (items.length === 0) {
    html += '<div class="empty-state">';
    html += '<div class="empty-icon">📦</div>';
    html += '<div class="empty-text">';
    if (STKVIEW.searchQuery) {
      html += 'ไม่พบวัตถุดิบที่ค้นหา';
    } else if (allItems.length === 0) {
      html += 'ยังไม่มีวัตถุดิบ — กด "เพิ่ม" เพื่อเริ่มต้น';
    } else {
      html += 'ไม่มีรายการตามเงื่อนไข';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  /* Summary */
  var totalValue = 0;
  for (var v = 0; v < allItems.length; v++) {
    totalValue += (allItems[v].qty || 0) * (allItems[v].costPerUnit || 0);
  }
  if (totalValue > 0) {
    html += '<div class="card-glass p-16 mb-16">';
    html += '<div class="flex gap-12 flex-wrap">';
    html += '<div><span class="text-muted fs-sm">📦 วัตถุดิบทั้งหมด</span><div class="fw-700">' + allItems.length + ' รายการ</div></div>';
    html += '<div><span class="text-muted fs-sm">💰 มูลค่าคงเหลือ</span><div class="fw-700 text-accent">' + formatMoneySign(roundTo(totalValue, 0)) + '</div></div>';
    html += '<div><span class="text-muted fs-sm">⚠️ ใกล้หมด</span><div class="fw-700 text-danger">' + low.length + ' รายการ</div></div>';
    html += '</div>';
    html += '</div>';
  }

  /* Stock cards */
  html += '<div class="stock-grid stagger" id="stockGrid">';
  for (var i = 0; i < items.length; i++) {
    html += renderStockCard(items[i], low);
  }
  html += '</div>';

  return html;
}

function filterStockItems(allItems, low) {
  var lowIds = {};
  for (var l = 0; l < low.length; l++) {
    lowIds[low[l].id] = true;
  }

  var result = [];
  for (var i = 0; i < allItems.length; i++) {
    var s = allItems[i];
    var isLow = !!lowIds[s.id];

    /* Status filter */
    if (STKVIEW.filterStatus === 'low' && !isLow) continue;
    if (STKVIEW.filterStatus === 'ok' && isLow) continue;

    /* Search filter */
    if (STKVIEW.searchQuery && !searchMatch(s.name, STKVIEW.searchQuery)) continue;

    result.push(s);
  }

  return result;
}

function renderStockCard(item, lowItems) {
  var isLow = false;
  for (var i = 0; i < lowItems.length; i++) {
    if (lowItems[i].id === item.id) { isLow = true; break; }
  }
  var isZero = item.qty <= 0;
  var value = roundTo((item.qty || 0) * (item.costPerUnit || 0), 2);

  /* Progress bar */
  var pctBar = 100;
  if (item.minQty > 0) {
    /* Show relative to 3x minQty as "full" */
    var fullRef = item.minQty * 3;
    pctBar = clamp(roundTo((item.qty / fullRef) * 100, 0), 0, 100);
  }
  var barColor = isZero ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)';

  var html = '';
  html += '<div class="stock-card anim-fadeUp' + (isLow ? ' low' : '') + (isZero ? ' zero' : '') + '">';

  /* Top: Name + badge */
  html += '<div class="flex-between mb-8">';
  html += '<div class="fw-700 truncate" style="flex:1;">' + sanitize(item.name) + '</div>';
  if (isZero) {
    html += '<span class="badge badge-danger">หมด!</span>';
  } else if (isLow) {
    html += '<span class="badge badge-warning">ใกล้หมด</span>';
  } else {
    html += '<span class="badge badge-success">ปกติ</span>';
  }
  html += '</div>';

  /* Qty + Unit */
  html += '<div class="flex-between mb-8">';
  html += '<div>';
  html += '<span class="stock-qty' + (isLow ? ' text-danger' : '') + '">' + formatMoney(item.qty) + '</span>';
  html += '<span class="text-muted fs-sm"> ' + sanitize(item.unit || '') + '</span>';
  html += '</div>';
  if (item.minQty > 0) {
    html += '<div class="text-muted fs-sm">ขั้นต่ำ: ' + formatMoney(item.minQty) + '</div>';
  }
  html += '</div>';

  /* Progress bar */
  html += '<div class="stock-bar">';
  html += '<div class="stock-bar-fill" style="width:' + pctBar + '%;background:' + barColor + ';"></div>';
  html += '</div>';

  /* Info row */
  html += '<div class="flex-between mt-8">';
  html += '<div class="text-muted fs-sm">';
  if (item.costPerUnit > 0) {
    html += formatMoneySign(item.costPerUnit) + '/' + sanitize(item.unit || 'หน่วย');
  }
  html += '</div>';
  if (value > 0) {
    html += '<div class="fs-sm">มูลค่า: <span class="fw-600 text-accent">' + formatMoneySign(roundTo(value, 0)) + '</span></div>';
  }
  html += '</div>';

  /* Last update */
  if (item.lastUpdate) {
    html += '<div class="text-muted fs-sm mt-8">อัพเดต: ' + relativeDay(item.lastUpdate) + '</div>';
  }

  /* Actions */
  html += '<div class="stock-actions mt-8">';
  html += '<button class="btn btn-success btn-sm" onclick="event.stopPropagation(); modalStockAdjust(findById(ST.getStock(),\'' + sanitize(item.id) + '\'),\'add\')">📥 รับเข้า</button>';
  html += '<button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); modalStockAdjust(findById(ST.getStock(),\'' + sanitize(item.id) + '\'),\'use\')">📤 ใช้ไป</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); modalEditStock(findById(ST.getStock(),\'' + sanitize(item.id) + '\'))">✏️</button>';
  html += '</div>';

  html += '</div>';
  return html;
}

/* Search */
var _stkSearchDebounce = debounce(function(val) {
  STKVIEW.searchQuery = val;
  setHTML('stkContent', renderStockList());
}, 250);

function stkSearch(val) {
  _stkSearchDebounce(val);
}

function stkFilterChange(val) {
  STKVIEW.filterStatus = val;
  setHTML('stkContent', renderStockList());
}

/* ============================================
   TAB: STOCK LOGS (ประวัติ)
   ============================================ */
function renderStockLogs() {
  var allLogs = ST.getStockLogs();

  var html = '';

  /* Toolbar */
  html += '<div class="flex-between mb-16" style="flex-wrap:wrap;gap:12px;">';

  html += '<div class="pos-search" style="flex:1;min-width:200px;max-width:400px;">';
  html += '<span class="pos-search-icon">🔍</span>';
  html += '<input type="text" id="logSearch" placeholder="ค้นหาชื่อวัตถุดิบ, หมายเหตุ..." value="' + sanitize(STKVIEW.logSearch) + '" oninput="logSearchFn(this.value)">';
  html += '</div>';

  html += '<div class="flex gap-8">';
  html += '<button class="btn btn-secondary btn-sm" onclick="clearStockLogs()">🗑 ล้างประวัติ</button>';
  html += '</div>';

  html += '</div>';

  /* Filter logs */
  var logs = filterStockLogs(allLogs);

  if (logs.length === 0) {
    html += '<div class="empty-state">';
    html += '<div class="empty-icon">📋</div>';
    html += '<div class="empty-text">' + (STKVIEW.logSearch ? 'ไม่พบประวัติ' : 'ยังไม่มีประวัติ') + '</div>';
    html += '</div>';
    return html;
  }

  /* Sort newest first */
  logs = sortBy(logs, 'timestamp', true);

  /* Pagination */
  var totalPages = Math.ceil(logs.length / STKVIEW.logPerPage);
  var startIdx = (STKVIEW.logPage - 1) * STKVIEW.logPerPage;
  var endIdx = Math.min(startIdx + STKVIEW.logPerPage, logs.length);
  var pageLogs = logs.slice(startIdx, endIdx);

  html += '<div class="text-muted fs-sm mb-8">แสดง ' + (startIdx + 1) + '-' + endIdx + ' จาก ' + logs.length + ' รายการ</div>';

  /* Group by date */
  var grouped = groupLogsByDate(pageLogs);
  var dateKeys = Object.keys(grouped);

  for (var d = 0; d < dateKeys.length; d++) {
    var dateStr = dateKeys[d];
    var dayLogs = grouped[dateStr];

    html += '<div class="log-date-header">';
    html += '<span class="fw-600">' + relativeDay(dateStr) + '</span>';
    html += '<span class="text-muted fs-sm">' + sanitize(dateStr) + '</span>';
    html += '</div>';

    html += '<div class="log-list">';
    for (var l = 0; l < dayLogs.length; l++) {
      html += renderLogItem(dayLogs[l]);
    }
    html += '</div>';
  }

  /* Pagination */
  if (totalPages > 1) {
    html += renderLogPagination(totalPages);
  }

  return html;
}

function filterStockLogs(allLogs) {
  if (!STKVIEW.logSearch) return allLogs;
  var result = [];
  var q = STKVIEW.logSearch.toLowerCase().trim();
  for (var i = 0; i < allLogs.length; i++) {
    var log = allLogs[i];
    if (searchMatch(log.stockName || '', q) ||
        searchMatch(log.reason || '', q)) {
      result.push(log);
    }
  }
  return result;
}

function groupLogsByDate(logs) {
  var result = {};
  for (var i = 0; i < logs.length; i++) {
    var d = logs[i].date || 'ไม่ระบุ';
    if (!result[d]) result[d] = [];
    result[d].push(logs[i]);
  }
  return result;
}

function renderLogItem(log) {
  var isAdd = (log.qty || 0) > 0;
  var icon = isAdd ? '📥' : '📤';
  var signClass = isAdd ? 'text-success' : 'text-danger';
  var sign = isAdd ? '+' : '';

  var html = '';
  html += '<div class="log-item anim-fadeUp">';

  html += '<div class="flex gap-12" style="align-items:flex-start;">';

  /* Icon */
  html += '<div class="log-icon ' + (isAdd ? 'add' : 'use') + '">' + icon + '</div>';

  /* Info */
  html += '<div style="flex:1;min-width:0;">';
  html += '<div class="flex-between">';
  html += '<div class="fw-600">' + sanitize(log.stockName || 'ไม่ระบุ') + '</div>';
  html += '<div class="fw-700 ' + signClass + '">' + sign + formatMoney(log.qty) + '</div>';
  html += '</div>';

  html += '<div class="flex-between mt-4">';
  html += '<div class="text-muted fs-sm">';
  if (log.reason) html += sanitize(log.reason);
  html += '</div>';
  html += '<div class="text-muted fs-sm">';
  html += sanitize(log.time || '');
  if (log.balance !== undefined) {
    html += ' | คงเหลือ: ' + formatMoney(log.balance);
  }
  html += '</div>';
  html += '</div>';

  html += '</div>'; /* end info */
  html += '</div>'; /* end flex */

  html += '</div>';
  return html;
}

/* Search */
var _logSearchDebounce = debounce(function(val) {
  STKVIEW.logSearch = val;
  STKVIEW.logPage = 1;
  setHTML('stkContent', renderStockLogs());
}, 250);

function logSearchFn(val) {
  _logSearchDebounce(val);
}

/* Clear logs */
function clearStockLogs() {
  var logs = ST.getStockLogs();
  if (logs.length === 0) {
    toast('ไม่มีประวัติ', 'info');
    return;
  }
  confirmDialog('ล้างประวัติ Stock ทั้งหมด (' + logs.length + ' รายการ)?', function() {
    ST.saveStockLogs([]);
    toast('ล้างประวัติแล้ว', 'warning');
    setHTML('stkContent', renderStockLogs());
  });
}

/* Log Pagination */
function renderLogPagination(totalPages) {
  var html = '<div class="pagination">';

  var prevDis = STKVIEW.logPage <= 1 ? ' disabled' : '';
  html += '<button class="btn btn-secondary btn-sm" onclick="logGoPage(' + (STKVIEW.logPage - 1) + ')"' + prevDis + '>← ก่อนหน้า</button>';

  html += '<div class="pagination-pages">';
  var startP = Math.max(1, STKVIEW.logPage - 2);
  var endP = Math.min(totalPages, STKVIEW.logPage + 2);

  if (startP > 1) {
    html += '<button class="pagination-num" onclick="logGoPage(1)">1</button>';
    if (startP > 2) html += '<span class="pagination-dots">...</span>';
  }
  for (var p = startP; p <= endP; p++) {
    var act = p === STKVIEW.logPage ? ' active' : '';
    html += '<button class="pagination-num' + act + '" onclick="logGoPage(' + p + ')">' + p + '</button>';
  }
  if (endP < totalPages) {
    if (endP < totalPages - 1) html += '<span class="pagination-dots">...</span>';
    html += '<button class="pagination-num" onclick="logGoPage(' + totalPages + ')">' + totalPages + '</button>';
  }
  html += '</div>';

  var nextDis = STKVIEW.logPage >= totalPages ? ' disabled' : '';
  html += '<button class="btn btn-secondary btn-sm" onclick="logGoPage(' + (STKVIEW.logPage + 1) + ')"' + nextDis + '>ถัดไป →</button>';

  html += '</div>';
  return html;
}

function logGoPage(page) {
  var logs = filterStockLogs(ST.getStockLogs());
  var totalPages = Math.ceil(logs.length / STKVIEW.logPerPage);
  STKVIEW.logPage = clamp(page, 1, totalPages || 1);
  setHTML('stkContent', renderStockLogs());

  var main = $('mainContent');
  if (main) main.scrollTop = 0;
}

/* ============================================
   ADDITIONAL CSS (inject once)
   ============================================ */
(function() {
  var styleId = 'stockViewStyle';
  if (document.getElementById(styleId)) return;

  var css = '';

  /* Alert card */
  css += '.stock-alert-card{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius);padding:16px;}';
  css += '.stock-alert-items{display:flex;flex-direction:column;gap:8px;}';
  css += '.stock-alert-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;';
  css += 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);gap:12px;}';
  css += '.stock-alert-item.zero{border-color:var(--danger);background:rgba(239,68,68,0.05);}';

  /* Stock grid */
  css += '.stock-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;}';

  /* Stock card */
  css += '.stock-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:all var(--transition);}';
  css += '.stock-card:hover{border-color:var(--accent);box-shadow:var(--shadow);}';
  css += '.stock-card.low{border-left:3px solid var(--warning);}';
  css += '.stock-card.zero{border-left:3px solid var(--danger);background:rgba(239,68,68,0.03);}';

  /* Stock qty */
  css += '.stock-qty{font-size:24px;font-weight:800;}';

  /* Stock bar */
  css += '.stock-bar{width:100%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;}';
  css += '.stock-bar-fill{height:100%;border-radius:3px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1);}';

  /* Stock actions */
  css += '.stock-actions{display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border);}';

  /* Log styles */
  css += '.log-date-header{display:flex;align-items:center;justify-content:space-between;padding:10px 0 6px;margin-top:8px;border-bottom:1px solid var(--border);}';
  css += '.log-list{display:flex;flex-direction:column;gap:4px;margin-bottom:8px;}';
  css += '.log-item{padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);transition:all var(--transition);}';
  css += '.log-item:hover{border-color:var(--accent);}';
  css += '.log-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm);font-size:18px;flex-shrink:0;}';
  css += '.log-icon.add{background:rgba(34,197,94,0.1);}';
  css += '.log-icon.use{background:rgba(239,68,68,0.1);}';

  /* Mobile */
  css += '@media(max-width:768px){';
  css += '.stock-grid{grid-template-columns:1fr;}';
  css += '.stock-alert-item{flex-direction:column;align-items:flex-start;gap:8px;}';
  css += '.stock-alert-item .flex.gap-8{width:100%;}';
  css += '.stock-alert-item .btn{flex:1;}';
  css += '}';

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
})();

console.log('[views-stock.js] loaded');