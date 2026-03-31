// ============================================
// BillFlow - Reusable UI Components
// ============================================

const UI = {
  // --- Page Header ---
  pageHeader(title, subtitle, actions = '') {
    return `<div class="page-header">
      <div class="page-header-left">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      ${actions ? `<div class="page-header-actions">${actions}</div>` : ''}
    </div>`;
  },

  // --- Stat Card ---
  statCard(icon, iconClass, label, value, change = '', changeDir = '') {
    return `<div class="stat-card">
      <div class="stat-info">
        <h3>${label}</h3>
        <div class="stat-value">${value}</div>
        ${change ? `<div class="stat-change ${changeDir}"><i class='bx ${changeDir === 'up' ? 'bx-trending-up' : 'bx-trending-down'}'></i> ${change}</div>` : ''}
      </div>
      <div class="stat-icon ${iconClass}"><i class='bx ${icon}'></i></div>
    </div>`;
  },

  // --- Data Table ---
  dataTable(columns, rows, id = 'dataTable') {
    const ths = columns.map(c => `<th>${c.label}</th>`).join('');
    const trs = rows.map(row => {
      const tds = columns.map(c => `<td>${c.render ? c.render(row) : row[c.key]}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<div class="table-container"><table id="${id}"><thead><tr>${ths}</tr></thead><tbody>${trs.length ? trs : `<tr><td colspan="${columns.length}" class="text-center text-muted" style="padding:2rem">No data found</td></tr>`}</tbody></table></div>`;
  },

  // --- Filter Bar ---
  filterBar(searchPlaceholder = 'Search...', filters = [], actions = '') {
    const filterHtml = filters.map(f =>
      `<select class="form-control" style="width:auto;min-width:140px"><option value="">${f.label}</option>${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`
    ).join('');
    return `<div class="filter-bar">
      <div class="search-input">
        <i class='bx bx-search'></i>
        <input type="text" placeholder="${searchPlaceholder}">
      </div>
      ${filterHtml}
      ${actions}
    </div>`;
  },

  // --- Pagination ---
  pagination(current = 1, total = 5, showing = '1-10 of 50') {
    let buttons = '';
    buttons += `<button ${current === 1 ? 'disabled' : ''}><i class='bx bx-chevron-left'></i></button>`;
    for (let i = 1; i <= total; i++) {
      buttons += `<button class="${i === current ? 'active' : ''}">${i}</button>`;
    }
    buttons += `<button ${current === total ? 'disabled' : ''}><i class='bx bx-chevron-right'></i></button>`;
    return `<div class="pagination">
      <div class="pagination-info">Showing ${showing}</div>
      <div class="pagination-buttons">${buttons}</div>
    </div>`;
  },

  // --- Tabs ---
  tabs(items, activeId) {
    return `<div class="tabs">${items.map(t => `<button class="tab ${t.id === activeId ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}</div>`;
  },

  // --- Card ---
  card(title, content, headerActions = '', footer = '') {
    return `<div class="card">
      <div class="card-header"><h3>${title}</h3>${headerActions ? `<div>${headerActions}</div>` : ''}</div>
      <div class="card-body">${content}</div>
      ${footer ? `<div class="card-footer">${footer}</div>` : ''}
    </div>`;
  },

  // --- Modal ---
  modal(id, title, content, footer = '', size = '') {
    return `<div class="modal-overlay" id="${id}">
      <div class="modal ${size}">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="App.closeModal('${id}')"><i class='bx bx-x'></i></button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>`;
  },

  // --- Product Card ---
  productCard(p) {
    const discount = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return `<div class="product-card" onclick="App.navigate('customer-product?id=${p.id}')">
      <div class="product-img">
        <i class='bx ${p.img}'></i>
        ${discount ? `<span class="tag badge badge-success">${discount}% OFF</span>` : ''}
        <button class="wishlist-btn" onclick="event.stopPropagation(); this.classList.toggle('active')"><i class='bx bx-heart'></i></button>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          <span class="price">${MockData.formatCurrency(p.price)}</span>
          ${discount ? `<span class="mrp">${MockData.formatCurrency(p.mrp)}</span>` : ''}
          ${discount ? `<span class="discount">${discount}% off</span>` : ''}
        </div>
        <div class="product-rating">
          ${UI.stars(p.rating)} <span>(${p.reviews})</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.showToast('Added to cart!','success')"><i class='bx bx-cart-add'></i> Add</button>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.navigate('customer-checkout')">Buy Now</button>
      </div>
    </div>`;
  },

  // --- Stars ---
  stars(rating) {
    let html = '<span class="stars">';
    for (let i = 1; i <= 5; i++) {
      html += `<i class='bx ${i <= Math.floor(rating) ? 'bxs-star' : (i - 0.5 <= rating ? 'bxs-star-half' : 'bx-star')} ${i > Math.ceil(rating) ? 'empty' : ''}'></i>`;
    }
    return html + '</span>';
  },

  // --- Timeline ---
  timeline(steps, currentIndex) {
    return `<div class="timeline">${steps.map((s, i) => {
      const state = i < currentIndex ? 'completed' : (i === currentIndex ? 'active' : 'pending');
      const icon = state === 'completed' ? 'bx-check' : s.icon;
      return `<div class="timeline-item">
        <div class="timeline-dot ${state}"><i class='bx ${icon}'></i></div>
        <div class="timeline-content">
          <h4>${s.title}</h4>
          <p>${s.subtitle || ''}</p>
        </div>
      </div>`;
    }).join('')}</div>`;
  },

  // --- Stepper ---
  stepper(steps, currentIndex) {
    return `<div class="stepper">${steps.map((s, i) => {
      const state = i < currentIndex ? 'completed' : (i === currentIndex ? 'active' : '');
      const line = i < steps.length - 1 ? `<div class="step-line ${i < currentIndex ? 'completed' : ''}"></div>` : '';
      return `<div class="step ${state}">
        <div class="step-num">${i < currentIndex ? '<i class="bx bx-check"></i>' : i + 1}</div>
        <div class="step-label">${s}</div>
      </div>${line}`;
    }).join('')}</div>`;
  },

  // --- Empty State ---
  emptyState(icon, title, message, action = '') {
    return `<div class="empty-state">
      <i class='bx ${icon}'></i>
      <h3>${title}</h3>
      <p>${message}</p>
      ${action}
    </div>`;
  },

  // --- Settings Item ---
  settingsItem(title, description, control) {
    return `<div class="settings-item">
      <div class="settings-item-info"><h4>${title}</h4><p>${description}</p></div>
      <div>${control}</div>
    </div>`;
  },

  // --- Toggle Switch ---
  toggle(id, checked = false) {
    return `<label class="form-switch"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}><span class="slider"></span></label>`;
  },

  // --- Form Group ---
  formGroup(label, input, hint = '') {
    return `<div class="form-group"><label>${label}</label>${input}${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
  },

  // --- Notification Item ---
  notifItem(n) {
    const iconMap = { order: 'bx-package blue', inventory: 'bx-box orange', payment: 'bx-money green', return: 'bx-undo red', alert: 'bx-error-circle orange', expiry: 'bx-time red' };
    const [icon, color] = (iconMap[n.type] || 'bx-bell blue').split(' ');
    return `<div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon stat-icon ${color}"><i class='bx ${icon}'></i></div>
      <div class="notif-content"><h4>${n.title}</h4><p>${n.message}</p></div>
      <div class="notif-time">${n.time}</div>
    </div>`;
  },

  // --- Master Page Template ---
  masterPage(config) {
    const { title, subtitle, icon, columns, data, addTitle, addFields } = config;
    const tableHtml = UI.dataTable(columns, data);
    const filterHtml = UI.filterBar(`Search ${title.toLowerCase()}...`, config.filters || []);

    const modalFields = (addFields || []).map(f => {
      if (f.type === 'select') {
        return UI.formGroup(f.label, `<select class="form-control"><option value="">Select ${f.label}</option>${(f.options || []).map(o => `<option>${o}</option>`).join('')}</select>`);
      }
      if (f.type === 'textarea') {
        return UI.formGroup(f.label, `<textarea class="form-control" placeholder="${f.placeholder || ''}" rows="3"></textarea>`);
      }
      return UI.formGroup(f.label, `<input type="${f.type || 'text'}" class="form-control" placeholder="${f.placeholder || ''}">`);
    }).join('');

    const modalHtml = UI.modal('masterModal', addTitle || `Add ${title}`, modalFields,
      `<button class="btn btn-secondary" onclick="App.closeModal('masterModal')">Cancel</button>
       <button class="btn btn-primary" onclick="App.closeModal('masterModal'); App.showToast('Saved successfully!','success')"><i class='bx bx-check'></i> Save</button>`
    );

    return UI.pageHeader(title, subtitle,
        `<button class="btn btn-secondary"><i class='bx bx-export'></i> Export</button>
         <button class="btn btn-primary" onclick="App.openModal('masterModal')"><i class='bx bx-plus'></i> Add New</button>`)
      + filterHtml
      + `<div class="card"><div class="card-body" style="padding:0">${tableHtml}</div></div>`
      + UI.pagination()
      + modalHtml;
  }
};
