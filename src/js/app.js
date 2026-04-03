// ============================================
// BillFlow - Main Application Controller
// ============================================

const App = {
  currentRole: 'admin',
  currentPage: 'admin-dashboard',

  // --- Navigation Configuration ---
  navConfig: {
    admin: [
      { section: 'Main' },
      { id: 'admin-dashboard', icon: 'bx-grid-alt', label: 'Dashboard' },
      { id: 'admin-company', icon: 'bx-building-house', label: 'Company Profile' },
      { section: 'Catalog' },
      { id: 'admin-items', icon: 'bx-package', label: 'Products & Items' },
      { id: 'admin-inventory', icon: 'bx-box', label: 'Inventory' },
      { id: 'admin-barcode', icon: 'bx-barcode', label: 'Barcode / QR' },
      { section: 'Masters', group: true, icon: 'bx-data', items: [
        { id: 'admin-categories', label: 'Categories' },
        { id: 'admin-brands', label: 'Brands' },
        { id: 'admin-tax', label: 'Tax Rates' },
        { id: 'admin-uom', label: 'Units (UOM)' },
        { id: 'admin-payment-modes', label: 'Payment Modes' },
        { id: 'admin-locations', label: 'Locations' },
        { id: 'admin-charges', label: 'Charges' }
      ]},
      { section: 'Business' },
      { id: 'admin-orders', icon: 'bx-receipt', label: 'Orders', badge: '15' },
      { id: 'admin-invoices', icon: 'bx-file', label: 'Invoices' },
      { id: 'admin-customers', icon: 'bx-group', label: 'Customers' },
      { id: 'admin-providers', icon: 'bx-store', label: 'Service Providers' },
      { id: 'admin-discounts', icon: 'bx-purchase-tag', label: 'Discounts' },
      { id: 'admin-offers', icon: 'bx-gift', label: 'Offers & Promos' },
      { section: 'Reports', group: true, icon: 'bx-bar-chart-alt-2', items: [
        { id: 'admin-reports-sales', label: 'Sales Report' },
        { id: 'admin-reports-tax', label: 'Tax Report' },
        { id: 'admin-reports-inventory', label: 'Inventory Report' }
      ]},
      { section: 'System' },
      { id: 'admin-notifications', icon: 'bx-bell', label: 'Notifications', badge: '3' },
      { id: 'admin-support', icon: 'bx-support', label: 'Support' },
      { section: 'Settings', group: true, icon: 'bx-cog', items: [
        { id: 'admin-general-settings', label: 'General Settings' },
        { id: 'admin-user-settings', label: 'User Management' },
        { id: 'admin-configuration', label: 'Configuration' }
      ]}
    ],
    customer: [
      { section: 'Shop' },
      { id: 'customer-home', icon: 'bx-home', label: 'Home' },
      { id: 'customer-search', icon: 'bx-search', label: 'Browse Products' },
      { id: 'customer-cart', icon: 'bx-cart', label: 'Cart', badge: '3' },
      { id: 'customer-wishlist', icon: 'bx-heart', label: 'Wishlist' },
      { section: 'Orders' },
      { id: 'customer-orders', icon: 'bx-package', label: 'My Orders' },
      { id: 'customer-delivery-tracking', icon: 'bx-map', label: 'Track Delivery' },
      { id: 'customer-invoices', icon: 'bx-file', label: 'Invoices' },
      { section: 'Account' },
      { id: 'customer-profile', icon: 'bx-user', label: 'Profile' },
      { id: 'customer-addresses', icon: 'bx-map-pin', label: 'Addresses' },
      { id: 'customer-payment-methods', icon: 'bx-credit-card', label: 'Payment Methods' },
      { id: 'customer-reviews', icon: 'bx-star', label: 'My Reviews' },
      { id: 'customer-notifications', icon: 'bx-bell', label: 'Notifications', badge: '2' },
      { id: 'customer-support', icon: 'bx-support', label: 'Help & Support' },
      { id: 'customer-settings', icon: 'bx-cog', label: 'Settings' }
    ],
    provider: [
      { section: 'Main' },
      { id: 'provider-dashboard', icon: 'bx-grid-alt', label: 'Dashboard' },
      { id: 'provider-orders', icon: 'bx-receipt', label: 'Orders', badge: '3' },
      { id: 'provider-products', icon: 'bx-package', label: 'Products' },
      { id: 'provider-earnings', icon: 'bx-wallet', label: 'Earnings' },
      { section: 'Feedback' },
      { id: 'provider-reviews', icon: 'bx-star', label: 'Reviews' },
      { id: 'provider-support', icon: 'bx-support', label: 'Support' },
      { id: 'provider-settings', icon: 'bx-cog', label: 'Settings' }
    ],
    waiter: [
      { section: 'Restaurant' },
      { id: 'waiter-pos', icon: 'bx-restaurant', label: 'Table Management' }
    ],
    kitchen: [
      { section: 'Kitchen' },
      { id: 'kitchen-kds', icon: 'bx-food-menu', label: 'Prep Queue' }
    ],
    delivery: [
      { section: 'Logistics' },
      { id: 'delivery-runs', icon: 'bx-cycling', label: 'Active Delivery Runs' }
    ]
  },

  // --- Mobile Nav Config ---
  mobileNav: {
    admin: [
      { id: 'admin-dashboard', icon: 'bx-grid-alt', label: 'Dashboard' },
      { id: 'admin-orders', icon: 'bx-receipt', label: 'Orders' },
      { id: 'admin-items', icon: 'bx-package', label: 'Products' },
      { id: 'admin-notifications', icon: 'bx-bell', label: 'Alerts' },
      { id: 'admin-general-settings', icon: 'bx-cog', label: 'Settings' }
    ],
    customer: [
      { id: 'customer-home', icon: 'bx-home', label: 'Home' },
      { id: 'customer-search', icon: 'bx-search', label: 'Browse' },
      { id: 'customer-cart', icon: 'bx-cart', label: 'Cart' },
      { id: 'customer-orders', icon: 'bx-package', label: 'Orders' },
      { id: 'customer-profile', icon: 'bx-user', label: 'Account' }
    ],
    provider: [
      { id: 'provider-dashboard', icon: 'bx-grid-alt', label: 'Dashboard' },
      { id: 'provider-orders', icon: 'bx-receipt', label: 'Orders' },
      { id: 'provider-products', icon: 'bx-package', label: 'Products' },
      { id: 'provider-earnings', icon: 'bx-wallet', label: 'Earnings' },
      { id: 'provider-settings', icon: 'bx-cog', label: 'Settings' }
    ],
    waiter: [
      { id: 'waiter-pos', icon: 'bx-restaurant', label: 'Tables' }
    ],
    kitchen: [
      { id: 'kitchen-kds', icon: 'bx-food-menu', label: 'Kitchen KDS' }
    ],
    delivery: [
      { id: 'delivery-runs', icon: 'bx-cycling', label: 'Deliveries' }
    ]
  },

  // --- Initialize ---
  init() {
    this.currentRole = localStorage.getItem('billflow_role') || 'admin';
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });
  },

  // --- Route Handler ---
  handleRoute() {
    const hash = window.location.hash.slice(1) || this.getDefaultPage();
    const [page] = hash.split('?');
    this.currentPage = page;
    this.currentRole = page.split('-')[0];
    this.renderSidebar();
    this.renderTopbar();
    this.renderMobileNav();
    this.renderContent();
    this.updateActiveNav();
    window.scrollTo(0, 0);
  },

  getDefaultPage() {
    const routes = { admin: 'admin-dashboard', customer: 'customer-home', provider: 'provider-dashboard', waiter: 'waiter-pos', kitchen: 'kitchen-kds', delivery: 'delivery-runs' };
    return routes[this.currentRole] || 'admin-dashboard';
  },

  // --- Navigate ---
  navigate(page) {
    window.location.hash = page;
  },

  // --- Render Sidebar ---
  renderSidebar() {
    const nav = this.navConfig[this.currentRole] || [];
    const user = MockData.users[this.currentRole];
    let html = `<div class="sidebar-header">
      <div class="logo"><i class='bx bx-receipt'></i> BillFlow</div>
      <button class="sidebar-close" onclick="App.closeSidebar()"><i class='bx bx-x'></i></button>
    </div>
    <nav class="sidebar-nav">`;

    nav.forEach(item => {
      if (item.section && !item.group) {
        html += `<div class="nav-section"><div class="nav-section-title">${item.section}</div></div>`;
      } else if (item.group) {
        html += `<div class="nav-group" id="group-${item.section.toLowerCase().replace(/\s/g,'')}">
          <button class="nav-item nav-group-toggle" onclick="this.parentElement.classList.toggle('open')">
            <i class='bx ${item.icon}'></i> ${item.section}
          </button>
          <div class="nav-group-items">
            ${item.items.map(sub => `<a class="nav-item" href="#${sub.id}" onclick="App.closeSidebar()">${sub.label}</a>`).join('')}
          </div>
        </div>`;
      } else if (item.id) {
        html += `<a class="nav-item" href="#${item.id}" onclick="App.closeSidebar()">
          <i class='bx ${item.icon}'></i> ${item.label}
          ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
        </a>`;
      }
    });

    html += `</nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="document.getElementById('profileDropdown').classList.toggle('open')">
        <div class="avatar">${user.avatar}</div>
        <div class="user-info">
          <div class="user-name">${user.name}</div>
          <div class="user-role">${user.role}</div>
        </div>
      </div>
    </div>`;

    document.getElementById('sidebar').innerHTML = html;

    // Auto-open group if current page is inside it
    nav.forEach(item => {
      if (item.group && item.items) {
        const isActive = item.items.some(sub => sub.id === this.currentPage);
        if (isActive) {
          const groupEl = document.getElementById('group-' + item.section.toLowerCase().replace(/\s/g, ''));
          if (groupEl) groupEl.classList.add('open');
        }
      }
    });
  },

  // --- Render Topbar ---
  renderTopbar() {
    const roleName = this.currentRole.charAt(0).toUpperCase() + this.currentRole.slice(1);
    const user = MockData.users[this.currentRole];
    document.getElementById('topbar').innerHTML = `
      <button class="topbar-menu-btn" onclick="App.openSidebar()"><i class='bx bx-menu'></i></button>
      <div class="topbar-breadcrumb">${roleName} / <span>${this.getPageTitle()}</span></div>
      <div class="topbar-search"><i class='bx bx-search'></i><input type="text" placeholder="Search anything..."></div>
      <div class="topbar-actions">
        <div class="dropdown">
          <button class="topbar-btn" onclick="this.parentElement.classList.toggle('open')" title="Switch Role">
            <i class='bx bx-transfer-alt'></i>
          </button>
          <div class="dropdown-menu">
            <button class="dropdown-item" onclick="App.switchRole('admin')"><i class='bx bx-shield-quarter'></i> Admin Panel</button>
            <button class="dropdown-item" onclick="App.switchRole('provider')"><i class='bx bx-store'></i> Provider Portal</button>
            <button class="dropdown-item" onclick="App.switchRole('customer')"><i class='bx bx-user'></i> Customer Portal</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="window.location.href='index.html'"><i class='bx bx-log-out'></i> Logout</button>
          </div>
        </div>
        <button class="topbar-btn" onclick="App.navigate('${this.currentRole}-notifications')" title="Notifications">
          <i class='bx bx-bell'></i>
          <span class="notif-dot"></span>
        </button>
        <div class="dropdown">
          <div class="topbar-profile" onclick="this.parentElement.classList.toggle('open')">
            <div class="avatar">${user.avatar}</div>
            <span class="name">${user.name}</span>
            <i class='bx bx-chevron-down' style="font-size:.9rem;color:var(--text-muted)"></i>
          </div>
          <div class="dropdown-menu">
            <button class="dropdown-item" onclick="App.navigate('${this.currentRole === 'customer' ? 'customer-profile' : this.currentRole === 'provider' ? 'provider-settings' : 'admin-user-settings'}')"><i class='bx bx-user'></i> Profile</button>
            <button class="dropdown-item" onclick="App.navigate('${this.currentRole === 'customer' ? 'customer-settings' : this.currentRole === 'provider' ? 'provider-settings' : 'admin-general-settings'}')"><i class='bx bx-cog'></i> Settings</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="window.location.href='index.html'"><i class='bx bx-log-out'></i> Logout</button>
          </div>
        </div>
      </div>`;
  },

  // --- Render Mobile Nav ---
  renderMobileNav() {
    const items = this.mobileNav[this.currentRole] || [];
    document.getElementById('mobile-nav').innerHTML = items.map(item =>
      `<button class="mobile-nav-item ${item.id === this.currentPage ? 'active' : ''}" onclick="App.navigate('${item.id}')">
        <i class='bx ${item.icon}'></i> ${item.label}
      </button>`
    ).join('');
  },

  // --- Render Content ---
  renderContent() {
    const page = this.currentPage;
    const renderFn = Pages[page];
    if (renderFn) {
      document.getElementById('content').innerHTML = renderFn();
    } else {
      document.getElementById('content').innerHTML = UI.emptyState(
        'bx-error-circle', 'Page Not Found',
        `The page "${page}" doesn't exist.`,
        `<button class="btn btn-primary" onclick="App.navigate('${this.getDefaultPage()}')">Go to Dashboard</button>`
      );
    }
  },

  // --- Update Active Nav ---
  updateActiveNav() {
    document.querySelectorAll('#sidebar .nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === '#' + this.currentPage) {
        item.classList.add('active');
      }
    });
    document.querySelectorAll('#mobile-nav .mobile-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    const mobileItems = this.mobileNav[this.currentRole] || [];
    const mobileButtons = document.querySelectorAll('#mobile-nav .mobile-nav-item');
    mobileItems.forEach((item, i) => {
      if (item.id === this.currentPage && mobileButtons[i]) {
        mobileButtons[i].classList.add('active');
      }
    });
  },

  // --- Get Page Title ---
  getPageTitle() {
    const titles = {
      'admin-dashboard': 'Dashboard', 'admin-company': 'Company Profile',
      'admin-categories': 'Categories', 'admin-brands': 'Brands', 'admin-tax': 'Tax Rates',
      'admin-uom': 'Units of Measurement', 'admin-payment-modes': 'Payment Modes',
      'admin-locations': 'Locations', 'admin-charges': 'Charges',
      'admin-items': 'Products', 'admin-item-add': 'Add Item', 'admin-inventory': 'Inventory',
      'admin-orders': 'Orders', 'admin-invoices': 'Invoices',
      'admin-customers': 'Customers', 'admin-providers': 'Service Providers',
      'admin-discounts': 'Discounts', 'admin-offers': 'Offers',
      'admin-barcode': 'Barcode / QR', 'admin-reports-sales': 'Sales Report',
      'admin-reports-tax': 'Tax Report', 'admin-reports-inventory': 'Inventory Report',
      'admin-notifications': 'Notifications', 'admin-support': 'Support',
      'admin-general-settings': 'General Settings', 'admin-user-settings': 'User Management',
      'admin-configuration': 'Configuration',
      'customer-home': 'Home', 'customer-search': 'Browse', 'customer-product': 'Product',
      'customer-cart': 'Cart', 'customer-wishlist': 'Wishlist',
      'customer-checkout': 'Checkout', 'customer-order-confirm': 'Confirmation',
      'customer-orders': 'Orders', 'customer-order-detail': 'Order Detail',
      'customer-delivery-tracking': 'Tracking', 'customer-invoices': 'Invoices',
      'customer-profile': 'Profile', 'customer-addresses': 'Addresses',
      'customer-payment-methods': 'Payment Methods', 'customer-support': 'Support',
      'customer-notifications': 'Notifications', 'customer-settings': 'Settings',
      'customer-reviews': 'Reviews',
      'provider-dashboard': 'Dashboard', 'provider-orders': 'Orders',
      'provider-products': 'Products', 'provider-earnings': 'Earnings',
      'provider-reviews': 'Reviews', 'provider-support': 'Support',
      'provider-settings': 'Settings',
      'waiter-pos': 'Table Management',
      'kitchen-kds': 'Kitchen Display System',
      'delivery-runs': 'Active Deliveries'
    };
    return titles[this.currentPage] || 'Page';
  },

  // --- Sidebar Open/Close ---
  openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.querySelector('.sidebar-overlay').classList.add('active');
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.querySelector('.sidebar-overlay').classList.remove('active');
  },

  // --- Modal ---
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  },

  // --- Switch Role ---
  switchRole(role) {
    this.currentRole = role;
    localStorage.setItem('billflow_role', role);
    const routes = { admin: 'admin-dashboard', customer: 'customer-home', provider: 'provider-dashboard', waiter: 'waiter-pos', kitchen: 'kitchen-kds', delivery: 'delivery-runs' };
    this.navigate(routes[role]);
  },

  // --- Toast ---
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'bx-check-circle', error: 'bx-error-circle', warning: 'bx-error' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class='bx ${icons[type] || icons.success}'></i><span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()"><i class='bx bx-x'></i></button>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};

// --- Initialize on Load ---
document.addEventListener('DOMContentLoaded', () => App.init());
