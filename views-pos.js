/* ============================================
   COFFEE POS — VIEWS-POS.JS
   หน้า POS หลัก
   Version: 2.0 (Sweet + DrinkType + Recent)
   ============================================ */

/* === POS STATE === */
var POS = {
  cart: [],
  selectedCat: 'all',
  searchQuery: '',
  discount: 0,
  discountType: 'baht',
  drawerOpen: false,
  selectedChannel: 'ch_walkin',
  selectedChannelName: 'Walk-in'
};

/* ============================================
   RENDER POS VIEW
   ============================================ */
function renderPOSView() {
  var main = $('mainContent');
  if (!main) return;

  var html = '';

  /* Low stock alert bar */
  var lowStock = ST.getLowStock();
  if (lowStock.length > 0) {
    html += '<div class="stock-alert-bar" onclick="nav(\'stock\')">';
    html += '⚠️ วัตถุดิบใกล้หมด: ';
    var names = [];
    for (var ls = 0; ls < lowStock.length && ls < 3; ls++) {
      names.push(sanitize(lowStock[ls].name));
    }
    html += names.join(', ');
    if (lowStock.length > 3) html += ' และอีก ' + (lowStock.length - 3) + ' รายการ';
    html += '</div>';
  }

  /* POS Layout */
  html += '<div class="pos-layout" id="posLayout">';

  /* === LEFT: Menu Area === */
  html += '<div class="pos-menu">';

  /* Search */
  html += '<div class="pos-menu-header">';
  html += '<div class="pos-search">';
  html += '<span class="pos-search-icon">🔍</span>';
  html += '<input type="text" id="posSearch" placeholder="ค้นหาเมนู..." value="' + sanitize(POS.searchQuery) + '" oninput="posSearchMenu(this.value)">';
  html += '</div>';
  html += '</div>';

    /* Favorites Row */
  html += renderFavoritesRow();

  /* Recent Orders Strip */
  html += renderRecentOrders();

  /* Category Tabs */
  html += renderCatTabs();

  /* Menu Grid */
  html += '<div class="menu-grid stagger" id="menuGrid">';
  html += renderMenuItems();
  html += '</div>';

  html += '</div>'; /* end pos-menu */

  /* === RIGHT: Cart (PC/Tablet) === */
  html += '<div class="pos-cart" id="posCart">';
  html += renderCart();
  html += '</div>';

  html += '</div>'; /* end pos-layout */

  /* === Mobile Cart Bar === */
  html += renderMobileCartBar();

  /* === Mobile Cart Drawer === */
  html += '<div class="cart-drawer-overlay" id="cartDrawerOverlay" onclick="closeCartDrawer()"></div>';
  html += '<div class="cart-drawer" id="cartDrawer">';
  html += '<div class="cart-drawer-handle"></div>';
  html += '<div id="cartDrawerContent" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">';
  html += renderCart();
  html += '</div>';
  html += '</div>';

  main.innerHTML = html;

/* ไม่ auto focus — ให้ user กดเองเมื่อต้องการค้นหา */}

/* ============================================
   RECENT ORDERS STRIP
   ============================================ */
function renderRecentOrders() {
  var orders = ST.getOrders();
  var recent = [];
  for (var i = orders.length - 1; i >= 0 && recent.length < 5; i--) {
    if (orders[i].status !== 'cancelled') {
      recent.push(orders[i]);
    }
  }

  if (recent.length === 0) return '';

  var cfg = ST.getConfig();
  var html = '';
  html += '<div class="recent-orders-strip" id="recentStrip">';

  /* Header */
  html += '<div class="recent-header">';
  html += '<div class="flex gap-8" style="align-items:center;">';
  html += '<span class="fw-600 fs-sm">🕐 ออเดอร์ล่าสุด</span>';
  html += '<span class="badge badge-accent">' + recent.length + '</span>';
  html += '</div>';
  html += '<button class="btn-icon" onclick="toggleRecentStrip()" style="width:28px;height:28px;font-size:14px;" title="ซ่อน/แสดง">';
  html += '<span id="recentToggleIcon">▾</span>';
  html += '</button>';
  html += '</div>';

  /* Scrollable cards */
  html += '<div class="recent-scroll" id="recentScroll">';
  for (var r = 0; r < recent.length; r++) {
    html += renderRecentCard(recent[r], cfg);
  }
  html += '</div>';

  html += '</div>';
  return html;
}

function renderRecentCard(order, cfg) {
  var items = order.items || [];
  var payIcons = { cash: '💵', transfer: '📱', qr: '📷' };
  var timeAgo = getTimeAgo(order.timestamp);

  var html = '';
  html += '<div class="recent-card">';

  /* Top: Order# + Time */
  html += '<div class="flex-between mb-4">';
  html += '<span class="fw-700 text-accent fs-sm">' + cfg.orderPrefix + padZ(order.number) + '</span>';
  html += '<span class="text-muted" style="font-size:11px;">' + timeAgo + '</span>';
  html += '</div>';

  /* Items preview — with full detail */
  html += '<div class="recent-items">';
  for (var i = 0; i < items.length && i < 3; i++) {
    var it = items[i];

    /* Line 1: Name */
    html += '<div class="recent-item-line">';
    html += '<span class="truncate fw-600">' + sanitize(it.name) + '</span>';
    html += '<span class="text-muted">x' + it.qty + '</span>';
    html += '</div>';

    /* Line 2: Tags — drinkType, size, sweetLevel */
    var tags = [];
    if (it.drinkTypeName) tags.push(it.drinkTypeName);
    if (it.size) tags.push(it.size);
    if (it.sweetName) tags.push(it.sweetName);

    if (tags.length > 0) {
      html += '<div class="recent-item-tags">';
      for (var tg = 0; tg < tags.length; tg++) {
        html += '<span class="recent-tag">' + sanitize(tags[tg]) + '</span>';
      }
      html += '</div>';
    }

    /* Toppings */
    if (it.toppingNames && it.toppingNames.length > 0) {
      html += '<div class="recent-item-sub">+' + sanitize(it.toppingNames.join(', ')) + '</div>';
    }
  }
  if (items.length > 3) {
    html += '<div class="recent-item-line text-muted" style="font-size:11px;">+' + (items.length - 3) + ' รายการ</div>';
  }
  html += '</div>';

  /* Bottom: Total + Actions */
  html += '<div class="flex-between mt-6" style="align-items:center;">';
  html += '<div class="flex gap-4" style="align-items:center;">';
  html += '<span>' + (payIcons[order.payment] || '💳') + '</span>';
  html += '<span class="fw-800 text-accent">' + formatMoneySign(order.total) + '</span>';
  html += '</div>';
  html += '<div class="flex gap-4">';
  html += '<button class="recent-btn" onclick="event.stopPropagation(); reorderFromRecent(\'' + sanitize(order.id) + '\')" title="สั่งซ้ำ">🔄</button>';
  html += '<button class="recent-btn" onclick="event.stopPropagation(); modalReceipt(findById(ST.getOrders(),\'' + sanitize(order.id) + '\'))" title="ใบเสร็จ">🧾</button>';
  html += '</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

/* Time ago helper */
function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  var now = Date.now();
  var diff = now - timestamp;
  var mins = Math.floor(diff / 60000);
  var hrs = Math.floor(diff / 3600000);

  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return mins + ' นาทีก่อน';
  if (hrs < 24) return hrs + ' ชม.ก่อน';
  return Math.floor(hrs / 24) + ' วันก่อน';
}

/* Toggle show/hide */
function toggleRecentStrip() {
  var scroll = $('recentScroll');
  var icon = $('recentToggleIcon');
  if (!scroll) return;

  if (scroll.style.display === 'none') {
    scroll.style.display = '';
    if (icon) icon.textContent = '▾';
  } else {
    scroll.style.display = 'none';
    if (icon) icon.textContent = '▸';
  }
  vibrate(20);
}

/* Reorder — copy items from previous order to cart */
function reorderFromRecent(orderId) {
  var orders = ST.getOrders();
  var order = findById(orders, orderId);
  if (!order || !order.items) return;

  var items = order.items;
  var addedCount = 0;

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var cartItem = {
      id: genId('ci'),
      menuId: it.menuId,
      name: it.name,
      size: it.size || 'S',
      drinkType: it.drinkType || '',
      drinkTypeName: it.drinkTypeName || '',
      drinkTypePrice: it.drinkTypePrice || 0,
      sweetLevel: it.sweetLevel || '',
      sweetName: it.sweetName || '',
      sweetPrice: it.sweetPrice || 0,
      toppings: it.toppings ? it.toppings.slice() : [],
      toppingNames: it.toppingNames ? it.toppingNames.slice() : [],
      qty: it.qty || 1,
      unitPrice: it.unitPrice || 0,
      toppingPrice: it.toppingPrice || 0,
      lineTotal: it.lineTotal || 0,
      note: it.note || ''
    };
    POS.cart.push(cartItem);
    addedCount += cartItem.qty;
  }

  refreshCartUI();
  vibrate(50);
  toast('🔄 สั่งซ้ำ ' + addedCount + ' รายการ', 'success', 2000);
}

/* ============================================
   [Standard Version] FAVORITES ROW
   ============================================ */
function renderFavoritesRow() {
  var favIds = ST.getFavorites();
  if (favIds.length === 0) return '';

  var menuItems = ST.getMenu();
  var favItems = [];
  for (var i = 0; i < favIds.length; i++) {
    var item = findById(menuItems, favIds[i]);
    if (item && item.active !== false) favItems.push(item);
  }

  if (favItems.length === 0) return '';

  var html = '<div class="fav-row">';
  html += '<div class="fav-header">';
  html += '<span class="fw-600 fs-sm">⭐ เมนูโปรด</span>';
  html += '</div>';
  html += '<div class="fav-scroll">';

  for (var f = 0; f < favItems.length; f++) {
    var it = favItems[f];
    var basePrice = ST.getMenuBasePrice(it);
    var cartQty = getCartQtyForMenu(it.id);

    html += '<div class="fav-item" onclick="onMenuItemClick(\'' + sanitize(it.id) + '\')">';
    if (cartQty > 0) {
      html += '<span class="fav-badge">' + cartQty + '</span>';
    }
    html += '<span class="fav-emoji">' + (it.emoji || '☕') + '</span>';
    html += '<span class="fav-name">' + sanitize(it.name) + '</span>';
    html += '<span class="fav-price">' + formatMoneySign(basePrice) + '</span>';
    html += '</div>';
  }

  html += '</div>';
  html += '</div>';
  return html;
}

function toggleFav(menuId, btn) {
  var added = ST.toggleFavorite(menuId);
  if (btn) {
    btn.textContent = added ? '⭐' : '☆';
    if (added) addClass(btn, 'active');
    else removeClass(btn, 'active');
  }
  /* Refresh favorites row */
  var favRow = qs('.fav-row');
  if (favRow) {
    favRow.outerHTML = renderFavoritesRow();
  } else if (added) {
    var catTabs = qs('.cat-tabs');
    if (catTabs) {
      var newRow = document.createElement('div');
      newRow.innerHTML = renderFavoritesRow();
      if (newRow.firstChild) {
        catTabs.parentNode.insertBefore(newRow.firstChild, catTabs);
      }
    }
  }
  vibrate(30);
  playSound(added ? 'add' : 'clear');
  toast(added ? '⭐ เพิ่มเป็นเมนูโปรดแล้ว' : 'ยกเลิกเมนูโปรดแล้ว', 'info', 1200);
}

/* ============================================
   CATEGORY TABS
   ============================================ */
function renderCatTabs() {
  var cats = ST.getCategories();
  var html = '<div class="cat-tabs" id="catTabs">';

  var allActive = POS.selectedCat === 'all' ? ' active' : '';
  html += '<button class="cat-tab' + allActive + '" onclick="selectCat(\'all\')">🏠 ทั้งหมด</button>';

  for (var i = 0; i < cats.length; i++) {
    var isActive = POS.selectedCat === cats[i].id ? ' active' : '';
    html += '<button class="cat-tab' + isActive + '" onclick="selectCat(\'' + sanitize(cats[i].id) + '\')">';
    html += (cats[i].icon || '📦') + ' ' + sanitize(cats[i].name);
    html += '</button>';
  }

  html += '</div>';
  return html;
}

function selectCat(catId) {
  POS.selectedCat = catId;
  vibrate(20);

  var tabs = qsa('.cat-tab');
  for (var i = 0; i < tabs.length; i++) {
    removeClass(tabs[i], 'active');
  }
  for (var j = 0; j < tabs.length; j++) {
    var onclickAttr = tabs[j].getAttribute('onclick') || '';
    if (onclickAttr.indexOf("'" + catId + "'") !== -1) {
      addClass(tabs[j], 'active');
    }
  }

  setHTML('menuGrid', renderMenuItems());
}

/* ============================================
   MENU ITEMS GRID
   ============================================ */
function renderMenuItems() {
  var allItems = ST.getActiveMenu();
  var items = [];

  for (var i = 0; i < allItems.length; i++) {
    if (POS.selectedCat === 'all' || allItems[i].catId === POS.selectedCat) {
      items.push(allItems[i]);
    }
  }

  if (POS.searchQuery) {
    var filtered = [];
    for (var s = 0; s < items.length; s++) {
      if (searchMatch(items[s].name, POS.searchQuery)) {
        filtered.push(items[s]);
      }
    }
    items = filtered;
  }

  items = sortBy(items, 'sort', false);

  if (items.length === 0) {
    return '<div class="empty-state" style="grid-column:1/-1;">'
      + '<div class="empty-icon">☕</div>'
      + '<div class="empty-text">'
      + (POS.searchQuery ? 'ไม่พบเมนู "' + sanitize(POS.searchQuery) + '"' : 'ยังไม่มีเมนูในหมวดนี้')
      + '</div></div>';
  }

  var html = '';
  for (var m = 0; m < items.length; m++) {
    var it = items[m];
    var basePrice = ST.getMenuBasePrice(it);
    var cartQty = getCartQtyForMenu(it.id);

    html += '<div class="menu-item anim-fadeUp" onclick="onMenuItemClick(\'' + sanitize(it.id) + '\')">';

    if (cartQty > 0) {
      html += '<div class="menu-item-badge">' + cartQty + '</div>';
    }

    if (it.image) {
      html += '<img class="menu-item-img" src="' + it.image + '" alt="">';
    } else {
      html += '<div class="menu-item-emoji">' + (it.emoji || '☕') + '</div>';
    }

    html += '<div class="menu-item-name">' + sanitize(it.name) + '</div>';
    html += '<div class="menu-item-price">' + formatMoneySign(basePrice) + '</div>';
/* Favorite button */
    var isFav = ST.isFavorite(it.id);
    html += '<button class="fav-btn' + (isFav ? ' active' : '') + '" onclick="event.stopPropagation(); toggleFav(\'' + sanitize(it.id) + '\', this)" title="' + (isFav ? 'ยกเลิกโปรด' : 'เพิ่มเป็นโปรด') + '">' + (isFav ? '⭐' : '☆') + '</button>';

    html += '</div>';
  }

  return html;
}

/* Search handler */
var _posSearchDebounce = debounce(function(val) {
  POS.searchQuery = val;
  setHTML('menuGrid', renderMenuItems());
}, 200);

function posSearchMenu(val) {
  _posSearchDebounce(val);
}

/* Get total qty in cart for a menu item */
function getCartQtyForMenu(menuId) {
  var total = 0;
  for (var i = 0; i < POS.cart.length; i++) {
    if (POS.cart[i].menuId === menuId) {
      total += POS.cart[i].qty;
    }
  }
  return total;
}

/* ============================================
   MENU ITEM CLICK → Add to Cart
   ============================================ */
function onMenuItemClick(menuId) {
  var items = ST.getMenu();
  var item = findById(items, menuId);
  if (!item) return;

  vibrate(30);

  var sizes = ST.getSizes();
  var prices = item.prices || {};
  var availSizes = [];
  for (var i = 0; i < sizes.length; i++) {
    var p = prices[sizes[i].name];
    if (p !== undefined && p > 0) availSizes.push(sizes[i]);
  }

  var toppings = ST.getToppings().filter(function(t) { return t.active !== false; });
  var sweetLevels = ST.getSweetLevels().filter(function(s) { return s.active !== false; });
  var drinkTypes = ST.getDrinkTypes().filter(function(d) { return d.active !== false; });

  var allowSweet = item.allowSweetLevel !== false;
  var allowDrinkType = item.allowDrinkType !== false;

  /* Count available drink types for this menu */
  var menuDrinkCount = 0;
  if (allowDrinkType) {
    for (var d = 0; d < drinkTypes.length; d++) {
      if (!item.availableDrinkTypes || item.availableDrinkTypes.indexOf(drinkTypes[d].id) !== -1) {
        menuDrinkCount++;
      }
    }
  }

  var hasOptions = (availSizes.length > 1) ||
                   (toppings.length > 0) ||
                   (allowSweet && sweetLevels.length > 0) ||
                   (allowDrinkType && menuDrinkCount > 1);

  /* Quick add only if NO options needed */
  if (!hasOptions) {
    var sizeName = availSizes.length > 0 ? availSizes[0].name : 'S';
    var price = prices[sizeName] || 0;

    /* Get default drink type */
    var defDT = '';
    var defDTName = '';
    var defDTPrice = 0;
    if (allowDrinkType && menuDrinkCount === 1) {
      for (var dd = 0; dd < drinkTypes.length; dd++) {
        if (!item.availableDrinkTypes || item.availableDrinkTypes.indexOf(drinkTypes[dd].id) !== -1) {
          defDT = drinkTypes[dd].id;
          defDTName = drinkTypes[dd].name;
          defDTPrice = drinkTypes[dd].addPrice || 0;
          break;
        }
      }
    }

    var cartItem = {
      id: genId('ci'),
      menuId: item.id,
      name: item.name,
      size: sizeName,
      drinkType: defDT,
      drinkTypeName: defDTName,
      drinkTypePrice: defDTPrice,
      sweetLevel: '',
      sweetName: '',
      sweetPrice: 0,
      toppings: [],
      toppingNames: [],
      qty: 1,
      unitPrice: price,
      toppingPrice: 0,
      lineTotal: price + defDTPrice,
      note: ''
    };
    addToCart(cartItem);
    toast(item.name + ' เพิ่มแล้ว', 'success', 1200);
    return;
  }

  modalAddToCart(item);
}

/* ============================================
   CART MANAGEMENT
   ============================================ */
function addToCart(cartItem) {
  var existing = findMatchingCartItem(cartItem);
  if (existing) {
    existing.qty += cartItem.qty;
    var unitTotal = (existing.unitPrice || 0) + (existing.toppingPrice || 0) + (existing.drinkTypePrice || 0) + (existing.sweetPrice || 0);
    existing.lineTotal = unitTotal * existing.qty;
  } else {
    POS.cart.push(cartItem);
  }
  refreshCartUI();

  /* [Standard Version] Sound */
  var cfg = ST.getConfig();
  if (cfg.soundEnabled !== false) playSound('add');
}

function findMatchingCartItem(newItem) {
  for (var i = 0; i < POS.cart.length; i++) {
    var c = POS.cart[i];
    if (c.menuId === newItem.menuId &&
        c.size === newItem.size &&
        c.drinkType === newItem.drinkType &&
        c.sweetLevel === newItem.sweetLevel &&
        c.note === newItem.note &&
        arraysEqual(c.toppings, newItem.toppings)) {
      return c;
    }
  }
  return null;
}

function arraysEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  var sortedA = a.slice().sort();
  var sortedB = b.slice().sort();
  for (var i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
}

function updateCartItemQty(cartItemId, delta) {
  var idx = findIndexById(POS.cart, cartItemId);
  if (idx === -1) return;

  POS.cart[idx].qty += delta;
  if (POS.cart[idx].qty <= 0) {
    POS.cart.splice(idx, 1);
  } else {
    var it = POS.cart[idx];
    var unitTotal = (it.unitPrice || 0) + (it.toppingPrice || 0) + (it.drinkTypePrice || 0) + (it.sweetPrice || 0);
    it.lineTotal = unitTotal * it.qty;
  }

  vibrate(20);
  refreshCartUI();
}

function removeCartItem(cartItemId) {
  removeById(POS.cart, cartItemId);
  vibrate(20);
  refreshCartUI();
}

function clearCart() {
  if (POS.cart.length === 0) return;
  confirmDialog('ล้างตะกร้าทั้งหมด?', function() {
    POS.cart = [];
    POS.discount = 0;
    POS.discountType = 'baht';
    refreshCartUI();
    toast('ล้างตะกร้าแล้ว', 'info');
  });
}

/* ============================================
   CART CALCULATIONS
   ============================================ */
function calcCartSubtotal() {
  var total = 0;
  for (var i = 0; i < POS.cart.length; i++) {
    total += POS.cart[i].lineTotal || 0;
  }
  return total;
}

function calcCartTotal() {
  var subtotal = calcCartSubtotal();
  var disc = POS.discount || 0;
  var discountAmt = POS.discountType === 'percent'
    ? roundTo(subtotal * disc / 100, 2)
    : disc;
  return Math.max(0, subtotal - discountAmt);
}

function calcGrandTotal() {
  var cfg = ST.getConfig();
  var afterDisc = calcCartTotal();
  var vat = cfg.vatEnabled ? roundTo(afterDisc * cfg.vatRate / 100, 2) : 0;
  var sc = cfg.serviceChargeEnabled ? roundTo(afterDisc * cfg.serviceChargeRate / 100, 2) : 0;
  return roundTo(afterDisc + vat + sc, 0);
}

function cartItemCount() {
  var count = 0;
  for (var i = 0; i < POS.cart.length; i++) {
    count += POS.cart[i].qty;
  }
  return count;
}

/* ============================================
   RENDER CART
   ============================================ */
function renderCart() {
  var html = '';

  /* Header */
  html += '<div class="cart-header">';
  html += '<div class="flex" style="align-items:center;">';
  html += '<span class="cart-title">🧾 ตะกร้า</span>';
  if (POS.cart.length > 0) {
    html += '<span class="cart-count">' + cartItemCount() + '</span>';
  }
  html += '</div>';
  if (POS.cart.length > 0) {
    html += '<button class="btn btn-sm btn-outline" onclick="clearCart()" style="color:var(--danger);border-color:var(--danger);">🗑 ล้าง</button>';
  }
  html += '</div>';

  /* Items */
  html += '<div class="cart-items">';
  if (POS.cart.length === 0) {
    html += '<div class="cart-empty">';
    html += '<div class="cart-empty-icon">🛒</div>';
    html += '<div class="cart-empty-text">ยังไม่มีรายการ</div>';
    html += '<div class="cart-empty-text text-muted fs-sm">กดเมนูเพื่อเพิ่มรายการ</div>';
    html += '</div>';
  } else {
    for (var i = 0; i < POS.cart.length; i++) {
      html += renderCartItem(POS.cart[i]);
    }
  }
  html += '</div>';

  /* Summary + Actions */
  if (POS.cart.length > 0) {
    html += renderCartSummary();
    html += renderCartActions();
  }

  return html;
}

function renderCartItem(item) {
  var html = '';
  html += '<div class="cart-item">';
  html += '<div class="cart-item-info">';

  /* Name */
  html += '<div class="cart-item-name">' + sanitize(item.name) + '</div>';

  /* Detail tags */
  var tags = [];
  if (item.drinkTypeName) tags.push(item.drinkTypeName);
  if (item.size) tags.push('Size ' + item.size);
  if (item.sweetName) tags.push(item.sweetName);

  if (tags.length > 0) {
    html += '<div class="cart-item-tags">';
    for (var t = 0; t < tags.length; t++) {
      html += '<span class="cart-tag">' + sanitize(tags[t]) + '</span>';
    }
    html += '</div>';
  }

  if (item.toppingNames && item.toppingNames.length > 0) {
    html += '<div class="cart-item-detail">+ ' + sanitize(item.toppingNames.join(', ')) + '</div>';
  }
  if (item.note) {
    html += '<div class="cart-item-detail">📝 ' + sanitize(item.note) + '</div>';
  }

  /* Qty controls */
  html += '<div class="cart-item-qty">';
  html += '<button class="qty-btn danger" onclick="updateCartItemQty(\'' + sanitize(item.id) + '\', -1)">−</button>';
  html += '<span class="qty-val">' + item.qty + '</span>';
  html += '<button class="qty-btn" onclick="updateCartItemQty(\'' + sanitize(item.id) + '\', 1)">+</button>';
  html += '<button class="qty-btn danger" onclick="removeCartItem(\'' + sanitize(item.id) + '\')" title="ลบ" style="margin-left:6px;font-size:12px;">✕</button>';
  html += '</div>';

  html += '</div>';
  html += '<div class="cart-item-price">' + formatMoneySign(item.lineTotal) + '</div>';
  html += '</div>';
  return html;
}

function renderCartSummary() {
  var subtotal = calcCartSubtotal();
  var cfg = ST.getConfig();

  var html = '<div class="cart-summary">';

  html += '<div class="cart-row">';
  html += '<span class="text-muted">ยอดรวม (' + cartItemCount() + ' รายการ)</span>';
  html += '<span class="fw-600">' + formatMoneySign(subtotal) + '</span>';
  html += '</div>';

  /* Discount */
  html += '<div class="cart-discount-row">';
  html += '<span class="text-muted fs-sm" style="white-space:nowrap;">ส่วนลด:</span>';
  html += '<input type="number" id="cartDiscount" value="' + (POS.discount || '') + '" placeholder="0" inputmode="numeric" oninput="onCartDiscountChange()">';
  html += '<select id="cartDiscountType" onchange="onCartDiscountChange()" style="width:70px;">';
  html += '<option value="baht"' + (POS.discountType === 'baht' ? ' selected' : '') + '>฿</option>';
  html += '<option value="percent"' + (POS.discountType === 'percent' ? ' selected' : '') + '>%</option>';
  html += '</select>';
  html += '</div>';

  if (POS.discountType === 'percent' && POS.discount > 0) {
    var discAmt = roundTo(subtotal * POS.discount / 100, 2);
    html += '<div class="cart-row text-danger">';
    html += '<span>ส่วนลด ' + POS.discount + '%</span>';
    html += '<span>-' + formatMoneySign(discAmt) + '</span>';
    html += '</div>';
  } else if (POS.discountType === 'baht' && POS.discount > 0) {
    html += '<div class="cart-row text-danger">';
    html += '<span>ส่วนลด</span>';
    html += '<span>-' + formatMoneySign(POS.discount) + '</span>';
    html += '</div>';
  }

  if (cfg.vatEnabled) {
    var afterDisc = calcCartTotal();
    var vat = roundTo(afterDisc * cfg.vatRate / 100, 2);
    html += '<div class="cart-row">';
    html += '<span class="text-muted">VAT ' + cfg.vatRate + '%</span>';
    html += '<span>+' + formatMoneySign(vat) + '</span>';
    html += '</div>';
  }
  if (cfg.serviceChargeEnabled) {
    var afterDisc2 = calcCartTotal();
    var sc = roundTo(afterDisc2 * cfg.serviceChargeRate / 100, 2);
    html += '<div class="cart-row">';
    html += '<span class="text-muted">SC ' + cfg.serviceChargeRate + '%</span>';
    html += '<span>+' + formatMoneySign(sc) + '</span>';
    html += '</div>';
  }

  var grandTotal = calcGrandTotal();
  html += '<div class="cart-row total">';
  html += '<span>💰 ยอดชำระ</span>';
  html += '<span>' + formatMoneySign(grandTotal) + '</span>';
  html += '</div>';

  html += '</div>';
  return html;
}

function renderCartActions() {
  var html = '<div class="cart-actions">';

  html += '<div class="payment-methods">';
  html += '<div class="pay-method active" data-method="cash" onclick="selectCartPayMethod(this)">';
  html += '<div class="pay-method-icon">💵</div><div>เงินสด</div></div>';
  html += '<div class="pay-method" data-method="transfer" onclick="selectCartPayMethod(this)">';
  html += '<div class="pay-method-icon">📱</div><div>โอน</div></div>';
  html += '<div class="pay-method" data-method="qr" onclick="selectCartPayMethod(this)">';
  html += '<div class="pay-method-icon">📷</div><div>QR</div></div>';
  html += '</div>';

  var disabled = POS.cart.length === 0 ? ' disabled' : '';
  var total = calcGrandTotal();
  html += '<button class="btn-pay' + disabled + '" id="btnPay" onclick="onPayClick()"' + disabled + '>';
  html += '💳 ชำระ ' + formatMoneySign(total);
  html += '</button>';

  html += '</div>';
  return html;
}

function selectCartPayMethod(el) {
  var parent = el.parentNode;
  var siblings = parent.querySelectorAll('.pay-method');
  for (var i = 0; i < siblings.length; i++) {
    removeClass(siblings[i], 'active');
  }
  addClass(el, 'active');
  vibrate(20);
}

/* ============================================
   DISCOUNT CHANGE
   ============================================ */
function onCartDiscountChange() {
  var discEl = $('cartDiscount');
  var typeEl = $('cartDiscountType');
  if (discEl) POS.discount = parseFloat(discEl.value) || 0;
  if (typeEl) POS.discountType = typeEl.value;

  if (POS.discountType === 'percent' && POS.discount > 100) {
    POS.discount = 100;
    if (discEl) discEl.value = 100;
  }

  refreshCartUI();
}

/* ============================================
   REFRESH CART UI
   ============================================ */
function refreshCartUI() {
  var pcCart = $('posCart');
  if (pcCart) pcCart.innerHTML = renderCart();

  var drawerContent = $('cartDrawerContent');
  if (drawerContent) drawerContent.innerHTML = renderCart();

  var mobileBar = $('mobileCartBar');
  if (mobileBar) {
    mobileBar.outerHTML = renderMobileCartBar();
  }

  updateMenuBadges();
}

function updateMenuBadges() {
  var gridItems = qsa('.menu-item');
  for (var i = 0; i < gridItems.length; i++) {
    var onclickAttr = gridItems[i].getAttribute('onclick') || '';
    var match = onclickAttr.match(/onMenuItemClick\('([^']+)'\)/);
    if (match) {
      var menuId = match[1];
      var qty = getCartQtyForMenu(menuId);
      var badge = gridItems[i].querySelector('.menu-item-badge');
      if (qty > 0) {
        if (badge) {
          badge.textContent = qty;
        } else {
          var badgeEl = document.createElement('div');
          badgeEl.className = 'menu-item-badge anim-scale';
          badgeEl.textContent = qty;
          gridItems[i].appendChild(badgeEl);
        }
      } else {
        if (badge) badge.parentNode.removeChild(badge);
      }
    }
  }
}

/* ============================================
   MOBILE CART BAR
   ============================================ */
function renderMobileCartBar() {
  var count = cartItemCount();
  var total = calcGrandTotal();

  var html = '<div class="mobile-cart-bar" id="mobileCartBar"';
  if (count === 0) html += ' style="display:none;"';
  html += ' onclick="openCartDrawer()">';

  html += '<div class="mobile-cart-summary">';
  html += '<div class="mobile-cart-info">';
  html += '<div class="mobile-cart-badge">' + count + '</div>';
  html += '<span class="fw-600">ตะกร้า</span>';
  html += '</div>';
  html += '<div class="flex" style="align-items:center;gap:12px;">';
  html += '<span class="mobile-cart-total">' + formatMoneySign(total) + '</span>';
  html += '<span class="mobile-cart-btn">ดูตะกร้า</span>';
  html += '</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

/* ============================================
   MOBILE CART DRAWER
   ============================================ */
function openCartDrawer() {
  var drawer = $('cartDrawer');
  var overlay = $('cartDrawerOverlay');
  if (!drawer) return;

  POS.drawerOpen = true;

  var content = $('cartDrawerContent');
  if (content) content.innerHTML = renderCart();

  addClass(overlay, 'show');
  addClass(drawer, 'open');
}

function closeCartDrawer() {
  var drawer = $('cartDrawer');
  var overlay = $('cartDrawerOverlay');
  POS.drawerOpen = false;
  removeClass(overlay, 'show');
  removeClass(drawer, 'open');
}

/* ============================================
   PAYMENT CLICK
   ============================================ */
function onPayClick() {
  if (POS.cart.length === 0) {
    toast('กรุณาเพิ่มรายการก่อน', 'warning');
    return;
  }

  if (POS.drawerOpen) closeCartDrawer();

  var subtotal = calcCartSubtotal();

  var selectedMethod = 'cash';
  var activePay = qs('.pos-cart .pay-method.active') || qs('.cart-drawer .pay-method.active');
  if (activePay) {
    selectedMethod = activePay.getAttribute('data-method') || 'cash';
  }

  if (selectedMethod !== 'cash') {
    quickCompleteOrder(selectedMethod);
    return;
  }

  modalPayment(POS.cart, subtotal, POS.discount, POS.discountType);
}

function quickCompleteOrder(method) {
  var cfg = ST.getConfig();
  var subtotal = calcCartSubtotal();
  var disc = POS.discount || 0;
  var dType = POS.discountType || 'baht';
  var discountAmt = dType === 'percent' ? roundTo(subtotal * disc / 100, 2) : disc;
  var afterDiscount = subtotal - discountAmt;

  var vat = cfg.vatEnabled ? roundTo(afterDiscount * cfg.vatRate / 100, 2) : 0;
  var sc = cfg.serviceChargeEnabled ? roundTo(afterDiscount * cfg.serviceChargeRate / 100, 2) : 0;
  var grandTotal = roundTo(afterDiscount + vat + sc, 0);

  var orderData = {
    subtotal: subtotal,
    discount: discountAmt,
    vat: vat,
    serviceCharge: sc,
    total: grandTotal,
    payment: method,
    received: grandTotal,
    change: 0
  };

  completeOrder(orderData);
}

/* ============================================
   COMPLETE ORDER
   ============================================ */
function completeOrder(orderData) {
  var cfg = ST.getConfig();

  var order = {
    items: cloneObj(POS.cart),
        channel: POS.selectedChannel || 'ch_walkin',
    channelName: POS.selectedChannelName || 'Walk-in',
    subtotal: orderData.subtotal,
    discount: orderData.discount,
    discountType: POS.discountType,
    vat: orderData.vat || 0,
    serviceCharge: orderData.serviceCharge || 0,
    total: orderData.total,
    payment: orderData.payment,
    received: orderData.received,
    change: orderData.change,
    staffId: APP.currentStaff ? APP.currentStaff.id : '',
    staffName: APP.currentStaff ? APP.currentStaff.name : '',
    note: ''
  };

  var saved = ST.addOrder(order);

  /* Reset cart */
  POS.cart = [];
  POS.discount = 0;
  POS.discountType = 'baht';

  /* Refresh UI */
  refreshCartUI();

  /* Refresh recent orders strip */
  var recentEl = $('recentStrip');
  if (recentEl) {
    recentEl.outerHTML = renderRecentOrders();
  } else {
    /* If strip didn't exist before, re-render might be needed */
    var posMenu = qs('.pos-menu .pos-menu-header');
    if (posMenu && posMenu.nextElementSibling) {
      var newStrip = document.createElement('div');
      newStrip.innerHTML = renderRecentOrders();
      if (newStrip.firstChild) {
        posMenu.parentNode.insertBefore(newStrip.firstChild, posMenu.nextElementSibling);
      }
    }
  }

  vibrate(100);
/* [Standard Version] Sound */
  var cfg2 = ST.getConfig();
  if (cfg2.soundEnabled !== false) playSound('success');

  toast('✅ ออเดอร์ ' + cfg.orderPrefix + padZ(saved.number) + ' สำเร็จ!', 'success', 3000);

  setTimeout(function() {
    showOrderComplete(saved);
  }, 300);
}

/* ============================================
   ORDER COMPLETE SCREEN
   ============================================ */
function showOrderComplete(order) {
  var cfg = ST.getConfig();

  var html = '';
  html += '<div class="text-center">';

  html += '<div style="font-size:72px;margin-bottom:12px;" class="anim-scale">✅</div>';
  html += '<div class="fw-800 fs-xl mb-8 text-success">ชำระเงินสำเร็จ!</div>';

  html += '<div class="card-glass p-16 mb-16" style="display:inline-block;">';
  html += '<div class="text-muted fs-sm">ออเดอร์</div>';
  html += '<div class="fw-800 text-accent" style="font-size:36px;">' + cfg.orderPrefix + padZ(order.number) + '</div>';
  html += '</div>';

  html += '<div class="mb-16">';
  html += '<div class="flex-between p-16" style="max-width:280px;margin:0 auto;">';
  html += '<span class="text-muted">ยอดชำระ</span>';
  html += '<span class="fw-800 fs-lg">' + formatMoneySign(order.total) + '</span>';
  html += '</div>';

  if (order.payment === 'cash' && order.change > 0) {
    html += '<div class="flex-between p-16" style="max-width:280px;margin:0 auto;">';
    html += '<span class="text-muted">เงินทอน</span>';
    html += '<span class="fw-800 fs-xl text-success">' + formatMoneySign(order.change) + '</span>';
    html += '</div>';
  }

  var payLabels = { cash: '💵 เงินสด', transfer: '📱 โอน', qr: '📷 QR' };
  html += '<div class="text-muted fs-sm mt-8">' + (payLabels[order.payment] || '') + '</div>';
  html += '</div>';

  html += '</div>';

  var footer = '';
  footer += '<button class="btn btn-secondary" onclick="closeMForce()">ปิด</button>';
  footer += '<button class="btn btn-primary" onclick="closeMForce(); modalReceipt(window._completedOrder);">🧾 ใบเสร็จ</button>';
  footer += '<button class="btn btn-success" onclick="closeMForce(); nav(\'pos\');">🛒 ออเดอร์ใหม่</button>';

  window._completedOrder = order;
  openModal('✅ สำเร็จ', html, footer);
}

/* ============================================
   UPDATE POS LAYOUT (on resize)
   ============================================ */
function updatePOSLayout() {
  var mobileBar = $('mobileCartBar');
  if (mobileBar) {
    mobileBar.style.display = (APP.isMobile && POS.cart.length > 0) ? '' : 'none';
  }
}

/* ============================================
   SWIPE TO CLOSE DRAWER
   ============================================ */
var _touchStartY = 0;
var _touchDeltaY = 0;

document.addEventListener('touchstart', function(e) {
  var drawer = $('cartDrawer');
  if (!drawer || !POS.drawerOpen) return;
  if (!drawer.contains(e.target)) return;
  _touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
  if (!POS.drawerOpen) return;
  _touchDeltaY = e.touches[0].clientY - _touchStartY;
}, { passive: true });

document.addEventListener('touchend', function() {
  if (!POS.drawerOpen) return;
  if (_touchDeltaY > 80) {
    closeCartDrawer();
  }
  _touchStartY = 0;
  _touchDeltaY = 0;
}, { passive: true });

/* ============================================
   CSS: RECENT ORDERS STRIP
   ============================================ */
(function() {
  var styleId = 'recentStripStyle';
  if (document.getElementById(styleId)) return;

  var css = '';

  css += '.recent-orders-strip{';
  css += 'background:var(--bg-secondary);';
  css += 'border-bottom:1px solid var(--border);';
  css += 'padding:0;';
  css += 'flex-shrink:0;';
  css += '}';

  css += '.recent-header{';
  css += 'display:flex;align-items:center;justify-content:space-between;';
  css += 'padding:8px 16px;';
  css += '}';

  css += '.recent-scroll{';
  css += 'display:flex;gap:10px;';
  css += 'padding:0 16px 10px;';
  css += 'overflow-x:auto;';
  css += '-ms-overflow-style:none;scrollbar-width:none;';
  css += '}';
  css += '.recent-scroll::-webkit-scrollbar{display:none;}';

  css += '.recent-card{';
  css += 'min-width:200px;max-width:240px;';
  css += 'background:var(--bg-card);';
  css += 'border:1px solid var(--border);';
  css += 'border-radius:var(--radius-sm);';
  css += 'padding:10px 12px;';
  css += 'flex-shrink:0;';
  css += 'transition:all var(--transition);';
  css += 'cursor:default;';
  css += '}';
  css += '.recent-card:hover{border-color:var(--accent);box-shadow:0 2px 12px rgba(0,0,0,0.15);}';

  css += '.recent-items{display:flex;flex-direction:column;gap:1px;}';
  css += '.recent-item-line{';
  css += 'display:flex;justify-content:space-between;gap:8px;';
  css += 'font-size:12px;line-height:1.5;';
  css += '}';

  css += '.recent-btn{';
  css += 'width:28px;height:28px;';
  css += 'display:flex;align-items:center;justify-content:center;';
  css += 'border-radius:6px;font-size:14px;';
  css += 'background:var(--glass);border:1px solid var(--border);';
  css += 'cursor:pointer;transition:all var(--transition);';
  css += '}';
  css += '.recent-btn:hover{border-color:var(--accent);background:rgba(249,115,22,0.1);}';
  css += '.recent-btn:active{transform:scale(0.9);}';
    /* Recent item tags */
  css += '.recent-item-tags{display:flex;gap:3px;flex-wrap:wrap;margin:1px 0;}';
  css += '.recent-tag{';
  css += 'display:inline-block;padding:1px 5px;font-size:9px;font-weight:600;';
  css += 'border-radius:3px;background:rgba(249,115,22,0.12);color:var(--accent);';
  css += 'line-height:1.4;';
  css += '}';
  css += '.recent-item-sub{font-size:10px;color:var(--text-muted);margin:1px 0;}';
/* [Standard Version] Favorites */
  css += '.fav-row{background:var(--bg-secondary);border-bottom:1px solid var(--border);padding:6px 16px 8px;flex-shrink:0;}';
  css += '.fav-header{margin-bottom:4px;}';
  css += '.fav-scroll{display:flex;gap:8px;overflow-x:auto;-ms-overflow-style:none;scrollbar-width:none;}';
  css += '.fav-scroll::-webkit-scrollbar{display:none;}';
  css += '.fav-item{display:flex;align-items:center;gap:6px;padding:6px 12px;';
  css += 'background:var(--bg-card);border:1px solid var(--border);border-radius:20px;';
  css += 'cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all var(--transition);position:relative;}';
  css += '.fav-item:hover{border-color:var(--accent);}';
  css += '.fav-item:active{transform:scale(0.95);}';
  css += '.fav-emoji{font-size:18px;}';
  css += '.fav-name{font-size:12px;font-weight:600;}';
  css += '.fav-price{font-size:11px;color:var(--accent);font-weight:700;}';
  css += '.fav-badge{position:absolute;top:-4px;right:-4px;background:var(--accent);color:#fff;';
  css += 'font-size:10px;font-weight:800;min-width:16px;height:16px;border-radius:8px;';
  css += 'display:flex;align-items:center;justify-content:center;padding:0 3px;}';

  /* Favorite button on menu item */
  css += '.fav-btn{position:absolute;top:4px;left:4px;width:24px;height:24px;';
  css += 'display:flex;align-items:center;justify-content:center;font-size:14px;';
  css += 'background:transparent;border:none;cursor:pointer;opacity:0.3;transition:all var(--transition);z-index:2;}';
  css += '.fav-btn:hover,.fav-btn.active{opacity:1;}';
  css += '.fav-btn.active{color:var(--accent);}';

  css += '@media(max-width:768px){';
  css += '.recent-header{padding:6px 12px;}';
  css += '.recent-scroll{padding:0 12px 8px;gap:8px;}';
  css += '.recent-card{min-width:170px;max-width:200px;padding:8px 10px;}';
  css += '}';

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
})();

console.log('[views-pos.js] loaded');