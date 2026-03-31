// ============================================
// BillFlow - All Page Templates
// ============================================

const Pages = {

  // ==========================================
  // ADMIN PAGES
  // ==========================================

  'admin-dashboard': () => {
    const s = MockData.dashboardStats;
    return UI.pageHeader('Dashboard', 'Welcome back! Here\'s what\'s happening today.')
      + `<div class="stats-grid">
          ${UI.statCard('bx-wallet', 'green', 'Total Sales', MockData.formatCurrency(s.totalSales), '+12.5% vs last month', 'up')}
          ${UI.statCard('bx-receipt', 'blue', 'Today\'s Sales', MockData.formatCurrency(s.todaySales), '+8.3% vs yesterday', 'up')}
          ${UI.statCard('bx-package', 'purple', 'Total Orders', s.totalOrders.toLocaleString(), '+5.2% this week', 'up')}
          ${UI.statCard('bx-group', 'teal', 'Customers', s.totalCustomers.toLocaleString(), `+${s.newCustomers} new today`, 'up')}
        </div>
        <div class="stats-grid">
          ${UI.statCard('bx-time-five', 'orange', 'Pending Orders', s.pendingOrders, 'Needs attention', '')}
          ${UI.statCard('bx-trending-up', 'indigo', 'Avg Order Value', MockData.formatCurrency(s.avgOrderValue), '+3.1%', 'up')}
          ${UI.statCard('bx-error-circle', 'red', 'Low Stock Items', s.lowStock, 'Action required', '')}
          ${UI.statCard('bx-undo', 'pink', 'Return Rate', s.returnRate + '%', '-0.4%', 'up')}
        </div>`
      + `<div class="grid-2">
          ${UI.card('Sales Overview', '<div class="chart-placeholder"><i class="bx bx-line-chart"></i><span>Sales chart will render here</span></div>',
            `<select class="form-control" style="width:auto;padding:.35rem .5rem;font-size:.8rem"><option>Last 7 Days</option><option>Last 30 Days</option><option>This Year</option></select>`)}
          ${UI.card('Top Selling Categories', '<div class="chart-placeholder"><i class="bx bx-pie-chart-alt-2"></i><span>Category chart will render here</span></div>')}
        </div>`
      + `<div class="mt-3">${UI.card('Recent Orders',
          UI.dataTable([
            { label: 'Order ID', render: r => `<span class="fw-600">${r.id}</span>` },
            { label: 'Customer', key: 'customer' },
            { label: 'Items', key: 'items' },
            { label: 'Total', render: r => `<span class="fw-600">${MockData.formatCurrency(r.total)}</span>` },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Date', render: r => MockData.formatDate(r.date) },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-show'></i></button></div>` }
          ], MockData.orders.slice(0, 5)),
          `<button class="btn btn-sm btn-secondary" onclick="App.navigate('admin-orders')">View All Orders</button>`
        )}</div>`;
  },

  'admin-company': () => {
    const c = MockData.company;
    return UI.pageHeader('Company Profile', 'Manage your business information and branding')
      + UI.tabs([
          { id: 'info', label: 'Business Info' },
          { id: 'tax', label: 'Tax & Registration' },
          { id: 'branding', label: 'Branding' },
          { id: 'branches', label: 'Branches' }
        ], 'info')
      + `<div class="card"><div class="card-body">
          <div class="form-row">
            ${UI.formGroup('Company Name', `<input class="form-control" value="${c.name}">`)}
            ${UI.formGroup('Trade Name', `<input class="form-control" value="${c.tradeName}">`)}
          </div>
          <div class="form-row">
            ${UI.formGroup('Business Type', `<select class="form-control"><option selected>Pvt Ltd</option><option>LLP</option><option>Partnership</option><option>Sole Proprietorship</option></select>`)}
            ${UI.formGroup('Industry / Domain', `<select class="form-control"><option selected>Retail</option><option>Restaurant</option><option>Hospital</option><option>School</option></select>`)}
          </div>
          <div class="form-row">
            ${UI.formGroup('Phone', `<input class="form-control" value="${c.phone}">`)}
            ${UI.formGroup('Email', `<input class="form-control" value="${c.email}">`)}
          </div>
          ${UI.formGroup('Website', `<input class="form-control" value="${c.website}">`)}
          ${UI.formGroup('Billing Address', `<textarea class="form-control" rows="2">${c.address}</textarea>`)}
          <div class="form-row">
            ${UI.formGroup('GSTIN', `<input class="form-control" value="${c.gstin}">`, '15-digit alphanumeric')}
            ${UI.formGroup('PAN', `<input class="form-control" value="${c.pan}">`)}
          </div>
          <div class="form-row">
            ${UI.formGroup('FSSAI License', `<input class="form-control" value="${c.fssai}">`)}
            ${UI.formGroup('Drug License', `<input class="form-control" value="${c.drugLicense}" placeholder="If applicable">`)}
          </div>
          <h3 style="margin:1.5rem 0 1rem;font-size:1rem;">Stamp & Signature</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Digital Stamp/Seal</label>
              <div style="border:2px dashed var(--border);border-radius:var(--radius);padding:2rem;text-align:center;color:var(--text-muted)">
                <i class='bx bx-cloud-upload' style="font-size:2rem"></i><br>
                <span style="font-size:.85rem">Click to upload (PNG, JPG, SVG - Max 2MB)</span>
              </div>
            </div>
            <div class="form-group">
              <label>Authorized Signature</label>
              <div style="border:2px dashed var(--border);border-radius:var(--radius);padding:2rem;text-align:center;color:var(--text-muted)">
                <i class='bx bx-pen' style="font-size:2rem"></i><br>
                <span style="font-size:.85rem">Click to upload signature</span>
              </div>
            </div>
          </div>
          <div style="margin-top:1.5rem;display:flex;gap:.5rem;justify-content:flex-end">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn btn-primary" onclick="App.showToast('Company profile saved!','success')"><i class='bx bx-check'></i> Save Changes</button>
          </div>
        </div></div>`;
  },

  'admin-categories': () => UI.masterPage({
    title: 'Categories', subtitle: 'Manage product categories and sub-categories', icon: 'bx-category',
    filters: [{ label: 'Status', options: ['Active', 'Inactive'] }],
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Category', render: r => `<div class="flex gap-1" style="align-items:center"><i class='bx ${r.icon}' style="font-size:1.3rem;color:var(--primary)"></i><span class="item-name">${r.name}</span></div>` },
      { label: 'Items', key: 'items' },
      { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button><button class="btn btn-ghost btn-sm btn-icon text-danger"><i class='bx bx-trash'></i></button></div>` }
    ],
    data: MockData.categories,
    addFields: [
      { label: 'Category Name', placeholder: 'Enter category name' },
      { label: 'Parent Category', type: 'select', options: ['None (Top Level)', ...MockData.categories.map(c => c.name)] },
      { label: 'Description', type: 'textarea', placeholder: 'Category description' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ]
  }),

  'admin-brands': () => UI.masterPage({
    title: 'Brands', subtitle: 'Manage product brands and manufacturers', icon: 'bx-purchase-tag',
    filters: [{ label: 'Category', options: ['Electronics', 'Apparel', 'Grocery', 'Pharma'] }],
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Brand', render: r => `<span class="item-name">${r.name}</span>` },
      { label: 'Category', key: 'category' },
      { label: 'Items', key: 'items' },
      { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button><button class="btn btn-ghost btn-sm btn-icon text-danger"><i class='bx bx-trash'></i></button></div>` }
    ],
    data: MockData.brands,
    addFields: [
      { label: 'Brand Name', placeholder: 'Enter brand name' },
      { label: 'Category', type: 'select', options: MockData.categories.map(c => c.name) },
      { label: 'Description', type: 'textarea', placeholder: 'Brand description' }
    ]
  }),

  'admin-tax': () => UI.masterPage({
    title: 'Tax Rates', subtitle: 'Configure GST, VAT and other tax rates', icon: 'bx-calculator',
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Tax Name', render: r => `<span class="fw-600">${r.name}</span>` },
      { label: 'Rate', render: r => `${r.rate}%` },
      { label: 'Type', key: 'type' },
      { label: 'HSN Range', key: 'hsn' },
      { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button></div>` }
    ],
    data: MockData.taxRates,
    addFields: [
      { label: 'Tax Name', placeholder: 'e.g., GST 18%' },
      { label: 'Rate (%)', type: 'number', placeholder: '18' },
      { label: 'Type', type: 'select', options: ['GST', 'CGST', 'SGST', 'IGST', 'Cess', 'VAT'] },
      { label: 'HSN/SAC Range', placeholder: 'e.g., 3001-3304' }
    ]
  }),

  'admin-uom': () => UI.masterPage({
    title: 'Units of Measurement', subtitle: 'Manage UOM and conversion factors', icon: 'bx-ruler',
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Unit Name', render: r => `<span class="fw-600">${r.name}</span>` },
      { label: 'Code', render: r => `<span class="badge badge-primary">${r.code}</span>` },
      { label: 'Type', key: 'type' },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button><button class="btn btn-ghost btn-sm btn-icon text-danger"><i class='bx bx-trash'></i></button></div>` }
    ],
    data: MockData.uoms,
    addFields: [
      { label: 'Unit Name', placeholder: 'e.g., Kilogram' },
      { label: 'Code', placeholder: 'e.g., KG' },
      { label: 'Type', type: 'select', options: ['Count', 'Weight', 'Volume', 'Length', 'Area', 'Pack'] }
    ]
  }),

  'admin-payment-modes': () => UI.masterPage({
    title: 'Payment Modes', subtitle: 'Configure accepted payment methods', icon: 'bx-credit-card',
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Payment Mode', render: r => `<div class="flex gap-1" style="align-items:center"><i class='bx ${r.icon}' style="font-size:1.2rem;color:var(--primary)"></i><span class="fw-600">${r.name}</span></div>` },
      { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button></div>` }
    ],
    data: MockData.paymentModes,
    addFields: [
      { label: 'Payment Mode Name', placeholder: 'e.g., UPI' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ]
  }),

  'admin-locations': () => UI.masterPage({
    title: 'Locations', subtitle: 'Manage warehouses, stores and branches', icon: 'bx-map',
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Location', render: r => `<div><span class="item-name">${r.name}</span><div class="item-sub">${r.city}</div></div>` },
      { label: 'Type', render: r => `<span class="badge badge-primary">${r.type}</span>` },
      { label: 'Capacity', key: 'capacity' },
      { label: 'Items', key: 'items' },
      { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button></div>` }
    ],
    data: MockData.locations,
    addFields: [
      { label: 'Location Name', placeholder: 'e.g., Main Warehouse' },
      { label: 'Type', type: 'select', options: ['Warehouse', 'Retail Store', 'Distribution Center'] },
      { label: 'City', placeholder: 'City name' },
      { label: 'Address', type: 'textarea', placeholder: 'Full address' }
    ]
  }),

  'admin-charges': () => UI.masterPage({
    title: 'Charges', subtitle: 'Configure delivery, packing and platform charges', icon: 'bx-dollar-circle',
    columns: [
      { label: 'ID', render: r => `#${r.id}` },
      { label: 'Charge Name', render: r => `<span class="fw-600">${r.name}</span>` },
      { label: 'Type', render: r => `<span class="badge badge-info">${r.type}</span>` },
      { label: 'Amount', render: r => `${MockData.formatCurrency(r.amount)}` },
      { label: 'Condition', key: 'condition' },
      { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
      { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button></div>` }
    ],
    data: MockData.charges,
    addFields: [
      { label: 'Charge Name', placeholder: 'e.g., Express Delivery' },
      { label: 'Type', type: 'select', options: ['Delivery', 'Packing', 'Platform', 'Service', 'Other'] },
      { label: 'Amount (₹)', type: 'number', placeholder: '0' },
      { label: 'Condition', placeholder: 'When this charge applies' }
    ]
  }),

  'admin-items': () => {
    const products = MockData.products;
    return UI.pageHeader('Products & Items', `${products.length} total items`,
        `<button class="btn btn-secondary"><i class='bx bx-import'></i> Import CSV</button>
         <button class="btn btn-secondary"><i class='bx bx-export'></i> Export</button>
         <button class="btn btn-primary" onclick="App.navigate('admin-item-add')"><i class='bx bx-plus'></i> Add Item</button>`)
      + UI.filterBar('Search items by name, SKU, brand...',
          [{ label: 'Category', options: MockData.categories.map(c => c.name) },
           { label: 'Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Item', render: r => `<div class="flex gap-1" style="align-items:center"><div class="stat-icon indigo" style="width:40px;height:40px;border-radius:8px;font-size:1.1rem"><i class='bx ${r.img}'></i></div><div><span class="item-name">${r.name}</span><div class="item-sub">${r.sku} · ${r.brand}</div></div></div>` },
            { label: 'Category', key: 'category' },
            { label: 'MRP', render: r => MockData.formatCurrency(r.mrp) },
            { label: 'Price', render: r => `<span class="fw-600">${MockData.formatCurrency(r.price)}</span>` },
            { label: 'Stock', render: r => `<span class="${r.stock < 20 ? 'text-danger fw-600' : ''}">${r.stock}</span>` },
            { label: 'GST', render: r => `${r.gst}%` },
            { label: 'Actions', render: r => `<div class="table-actions">
              <button class="btn btn-ghost btn-sm btn-icon" title="Edit" onclick="App.navigate('admin-item-add?id=${r.id}')"><i class='bx bx-edit'></i></button>
              <button class="btn btn-ghost btn-sm btn-icon" title="View"><i class='bx bx-show'></i></button>
              <button class="btn btn-ghost btn-sm btn-icon text-danger" title="Delete"><i class='bx bx-trash'></i></button></div>` }
          ], products)}
        </div></div>` + UI.pagination(1, 3, '1-12 of 36');
  },

  'admin-item-add': () => {
    return UI.pageHeader('Add New Item', 'Fill in the product details',
        `<button class="btn btn-secondary" onclick="App.navigate('admin-items')"><i class='bx bx-arrow-back'></i> Back</button>`)
      + `<div class="grid-2">
          <div>
            ${UI.card('Basic Information', `
              <div class="form-row">${UI.formGroup('Item Name *', '<input class="form-control" placeholder="Enter item name">')}${UI.formGroup('Short Name', '<input class="form-control" placeholder="Short display name">')}</div>
              <div class="form-row">${UI.formGroup('SKU *', '<input class="form-control" placeholder="Auto-generated or manual">')}${UI.formGroup('HSN/SAC Code', '<input class="form-control" placeholder="Enter HSN code">')}</div>
              ${UI.formGroup('Description', '<textarea class="form-control" rows="3" placeholder="Product description..."></textarea>')}
              <div class="form-row-3">
                ${UI.formGroup('Category *', `<select class="form-control"><option>Select Category</option>${MockData.categories.map(c => `<option>${c.name}</option>`).join('')}</select>`)}
                ${UI.formGroup('Sub-Category', '<select class="form-control"><option>Select Sub-Category</option></select>')}
                ${UI.formGroup('Brand', `<select class="form-control"><option>Select Brand</option>${MockData.brands.map(b => `<option>${b.name}</option>`).join('')}</select>`)}
              </div>
            `)}
            <div class="mt-2">${UI.card('Pricing & Tax', `
              <div class="form-row-3">
                ${UI.formGroup('MRP (₹) *', '<input type="number" class="form-control" placeholder="0.00">')}
                ${UI.formGroup('Selling Price (₹) *', '<input type="number" class="form-control" placeholder="0.00">')}
                ${UI.formGroup('Purchase Price (₹)', '<input type="number" class="form-control" placeholder="0.00">')}
              </div>
              <div class="form-row-3">
                ${UI.formGroup('Wholesale Price (₹)', '<input type="number" class="form-control" placeholder="0.00">')}
                ${UI.formGroup('GST Rate', '<select class="form-control"><option>0%</option><option>5%</option><option>12%</option><option selected>18%</option><option>28%</option></select>')}
                ${UI.formGroup('GST Type', '<select class="form-control"><option>Exclusive</option><option>Inclusive</option></select>')}
              </div>
            `)}</div>
          </div>
          <div>
            ${UI.card('Images', `
              <div style="border:2px dashed var(--border);border-radius:var(--radius);padding:2.5rem;text-align:center;color:var(--text-muted)">
                <i class='bx bx-image-add' style="font-size:2.5rem"></i><br>
                <span style="font-size:.85rem">Drag & drop or click to upload<br>Up to 10 images (PNG, JPG — Max 5MB each)</span>
              </div>
            `)}
            <div class="mt-2">${UI.card('Stock & Units', `
              <div class="form-row">
                ${UI.formGroup('Opening Stock', '<input type="number" class="form-control" placeholder="0">')}
                ${UI.formGroup('Reorder Level', '<input type="number" class="form-control" placeholder="0">')}
              </div>
              <div class="form-row">
                ${UI.formGroup('Primary UOM', `<select class="form-control">${MockData.uoms.map(u => `<option>${u.name} (${u.code})</option>`).join('')}</select>`)}
                ${UI.formGroup('Packing Size', '<input class="form-control" placeholder="e.g., 500g, Pack of 6">')}
              </div>
              <div class="form-row">
                ${UI.formGroup('Weight (g)', '<input type="number" class="form-control" placeholder="0">')}
                ${UI.formGroup('Dimensions (L×W×H cm)', '<input class="form-control" placeholder="0 × 0 × 0">')}
              </div>
            `)}</div>
            <div class="mt-2">${UI.card('Additional Details', `
              ${UI.formGroup('Manufacturer', '<input class="form-control" placeholder="Made by...">')}
              ${UI.formGroup('Country of Origin', '<select class="form-control"><option>India</option><option>China</option><option>USA</option><option>Other</option></select>')}
              <div class="form-row">
                ${UI.formGroup('Expiry Date', '<input type="date" class="form-control">')}
                ${UI.formGroup('Batch Number', '<input class="form-control" placeholder="Batch #">')}
              </div>
            `)}</div>
          </div>
        </div>
        <div style="margin-top:1.5rem;display:flex;gap:.5rem;justify-content:flex-end">
          <button class="btn btn-secondary" onclick="App.navigate('admin-items')">Cancel</button>
          <button class="btn btn-secondary"><i class='bx bx-save'></i> Save as Draft</button>
          <button class="btn btn-primary" onclick="App.showToast('Item saved successfully!','success'); App.navigate('admin-items')"><i class='bx bx-check'></i> Save & Publish</button>
        </div>`;
  },

  'admin-inventory': () => {
    return UI.pageHeader('Inventory & Stock', 'Track stock levels across all locations',
        `<button class="btn btn-secondary"><i class='bx bx-transfer-alt'></i> Stock Transfer</button>
         <button class="btn btn-primary"><i class='bx bx-plus'></i> Stock In</button>`)
      + `<div class="stats-grid">
          ${UI.statCard('bx-package', 'blue', 'Total Items', '4,635', '', '')}
          ${UI.statCard('bx-check-circle', 'green', 'In Stock', '4,312', '', '')}
          ${UI.statCard('bx-error', 'orange', 'Low Stock', '23', 'Below reorder level', '')}
          ${UI.statCard('bx-x-circle', 'red', 'Out of Stock', '45', 'Needs restocking', '')}
        </div>`
      + UI.tabs([{ id: 'all', label: 'All Stock' }, { id: 'low', label: 'Low Stock' }, { id: 'expired', label: 'Near Expiry' }, { id: 'movements', label: 'Stock Movements' }], 'all')
      + UI.filterBar('Search items...',
          [{ label: 'Location', options: MockData.locations.map(l => l.name) },
           { label: 'Category', options: MockData.categories.map(c => c.name) }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Item', render: r => `<div><span class="item-name">${r.name}</span><div class="item-sub">${r.sku}</div></div>` },
            { label: 'Category', key: 'category' },
            { label: 'Stock', render: r => `<span class="${r.stock < 20 ? 'text-danger fw-600' : 'fw-600'}">${r.stock}</span>` },
            { label: 'Location', render: () => 'Main Warehouse' },
            { label: 'Value', render: r => MockData.formatCurrency(r.stock * r.price) },
            { label: 'Status', render: r => r.stock === 0 ? '<span class="badge badge-danger">Out of Stock</span>' : r.stock < 20 ? '<span class="badge badge-warning">Low Stock</span>' : '<span class="badge badge-success">In Stock</span>' },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-sm btn-secondary">Adjust</button></div>` }
          ], MockData.products)}
        </div></div>` + UI.pagination();
  },

  'admin-orders': () => {
    return UI.pageHeader('Order Management', 'Track and manage all orders')
      + `<div class="stats-grid">
          ${UI.statCard('bx-package', 'blue', 'Total Orders', '1,245', '', '')}
          ${UI.statCard('bx-time-five', 'orange', 'Pending', '15', '', '')}
          ${UI.statCard('bx-truck', 'purple', 'In Transit', '28', '', '')}
          ${UI.statCard('bx-check-circle', 'green', 'Delivered', '1,180', '', '')}
        </div>`
      + UI.tabs([
          { id: 'all', label: 'All Orders' }, { id: 'pending', label: 'Pending' },
          { id: 'processing', label: 'Processing' }, { id: 'shipped', label: 'Shipped' },
          { id: 'delivered', label: 'Delivered' }, { id: 'cancelled', label: 'Cancelled' }
        ], 'all')
      + UI.filterBar('Search by order ID, customer...', [
          { label: 'Status', options: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
          { label: 'Payment', options: ['UPI', 'Credit Card', 'Cash', 'Net Banking'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Order ID', render: r => `<span class="fw-600 text-primary" style="cursor:pointer">${r.id}</span>` },
            { label: 'Customer', key: 'customer' },
            { label: 'Items', key: 'items' },
            { label: 'Total', render: r => `<span class="fw-600">${MockData.formatCurrency(r.total)}</span>` },
            { label: 'Payment', key: 'payment' },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Date', render: r => MockData.formatDate(r.date) },
            { label: 'Actions', render: () => `<div class="table-actions">
              <button class="btn btn-ghost btn-sm btn-icon" title="View"><i class='bx bx-show'></i></button>
              <button class="btn btn-ghost btn-sm btn-icon" title="Print"><i class='bx bx-printer'></i></button></div>` }
          ], MockData.orders)}
        </div></div>` + UI.pagination();
  },

  'admin-invoices': () => {
    return UI.pageHeader('Invoices', 'Generate and manage invoices',
        `<button class="btn btn-secondary"><i class='bx bx-export'></i> Export All</button>
         <button class="btn btn-primary"><i class='bx bx-plus'></i> New Invoice</button>`)
      + UI.tabs([
          { id: 'all', label: 'All Invoices' }, { id: 'tax', label: 'Tax Invoices' },
          { id: 'credit', label: 'Credit Notes' }, { id: 'proforma', label: 'Proforma' }
        ], 'all')
      + UI.filterBar('Search invoices...', [{ label: 'Status', options: ['Paid', 'Unpaid', 'Overdue'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Invoice #', render: r => `<span class="fw-600 text-primary">${r.id}</span>` },
            { label: 'Order', key: 'order' },
            { label: 'Customer', key: 'customer' },
            { label: 'Type', render: r => `<span class="badge badge-info">${r.type}</span>` },
            { label: 'Amount', render: r => `<span class="fw-600">${MockData.formatCurrency(r.amount)}</span>` },
            { label: 'Tax', render: r => MockData.formatCurrency(r.tax) },
            { label: 'Date', render: r => MockData.formatDate(r.date) },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Actions', render: () => `<div class="table-actions">
              <button class="btn btn-ghost btn-sm btn-icon" title="View"><i class='bx bx-show'></i></button>
              <button class="btn btn-ghost btn-sm btn-icon" title="Download"><i class='bx bx-download'></i></button>
              <button class="btn btn-ghost btn-sm btn-icon" title="Print"><i class='bx bx-printer'></i></button></div>` }
          ], MockData.invoices)}
        </div></div>` + UI.pagination(1, 2, '1-5 of 8');
  },

  'admin-customers': () => {
    return UI.pageHeader('Customers', 'Manage customer database',
        `<button class="btn btn-secondary"><i class='bx bx-import'></i> Import</button>
         <button class="btn btn-primary"><i class='bx bx-plus'></i> Add Customer</button>`)
      + UI.filterBar('Search customers...', [
          { label: 'Type', options: ['B2B', 'B2C', 'Walk-in'] },
          { label: 'Tier', options: ['Silver', 'Gold', 'Platinum', 'Diamond'] },
          { label: 'Status', options: ['Active', 'Blocked'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Customer', render: r => `<div class="flex gap-1" style="align-items:center"><div class="avatar-sm">${r.name.split(' ').map(n=>n[0]).join('')}</div><div><span class="item-name">${r.name}</span><div class="item-sub">${r.email}</div></div></div>` },
            { label: 'Phone', key: 'phone' },
            { label: 'Type', render: r => `<span class="badge badge-primary">${r.type}</span>` },
            { label: 'Tier', render: r => `<span class="badge ${r.tier==='Diamond'?'badge-purple':r.tier==='Platinum'?'badge-info':r.tier==='Gold'?'badge-warning':'badge-default'}">${r.tier}</span>` },
            { label: 'Orders', key: 'orders' },
            { label: 'Total Spent', render: r => `<span class="fw-600">${MockData.formatCurrency(r.spent)}</span>` },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-show'></i></button><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button></div>` }
          ], MockData.customers)}
        </div></div>` + UI.pagination(1, 2, '1-7 of 12');
  },

  'admin-providers': () => {
    return UI.pageHeader('Service Providers', 'Manage delivery partners and vendors',
        `<button class="btn btn-primary"><i class='bx bx-plus'></i> Add Provider</button>`)
      + UI.filterBar('Search providers...', [
          { label: 'Type', options: ['Delivery', 'Vendor', 'Seller'] },
          { label: 'Status', options: ['Active', 'Suspended', 'Pending'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Provider', render: r => `<div><span class="item-name">${r.name}</span><div class="item-sub">${r.contact}</div></div>` },
            { label: 'Phone', key: 'phone' },
            { label: 'Type', render: r => `<span class="badge badge-info">${r.type}</span>` },
            { label: 'Orders', key: 'orders' },
            { label: 'Rating', render: r => `${UI.stars(r.rating)} <span class="text-muted" style="font-size:.8rem">${r.rating}</span>` },
            { label: 'Commission', key: 'commission' },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Actions', render: r => `<div class="table-actions">
              <button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-show'></i></button>
              <button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button>
              ${r.status === 'active' ? '<button class="btn btn-ghost btn-sm btn-icon text-danger"><i class="bx bx-block"></i></button>' : '<button class="btn btn-ghost btn-sm btn-icon text-success"><i class="bx bx-check-circle"></i></button>'}</div>` }
          ], MockData.providers)}
        </div></div>`;
  },

  'admin-discounts': () => {
    return UI.pageHeader('Discounts & Pricing', 'Manage discounts, offers and pricing rules',
        `<button class="btn btn-primary" onclick="App.openModal('discountModal')"><i class='bx bx-plus'></i> Create Discount</button>`)
      + UI.tabs([{ id: 'active', label: 'Active' }, { id: 'scheduled', label: 'Scheduled' }, { id: 'expired', label: 'Expired' }, { id: 'coupons', label: 'Coupon Codes' }], 'active')
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Discount', render: r => `<span class="fw-600">${r.name}</span>` },
            { label: 'Type', render: r => `<span class="badge badge-primary">${r.type}</span>` },
            { label: 'Value', render: r => `<span class="fw-600">${r.value}</span>` },
            { label: 'Applies To', key: 'applies' },
            { label: 'Valid Till', render: r => MockData.formatDate(r.validTill) },
            { label: 'Used', key: 'used' },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button><button class="btn btn-ghost btn-sm btn-icon text-danger"><i class='bx bx-trash'></i></button></div>` }
          ], MockData.discounts)}
        </div></div>`
      + UI.modal('discountModal', 'Create Discount', `
          ${UI.formGroup('Discount Name', '<input class="form-control" placeholder="e.g., Summer Sale 20%">')}
          <div class="form-row">
            ${UI.formGroup('Type', '<select class="form-control"><option>Percentage</option><option>Flat Amount</option><option>Special Price</option></select>')}
            ${UI.formGroup('Value', '<input class="form-control" placeholder="e.g., 20% or ₹200">')}
          </div>
          <div class="form-row">
            ${UI.formGroup('Valid From', '<input type="date" class="form-control">')}
            ${UI.formGroup('Valid Till', '<input type="date" class="form-control">')}
          </div>
          ${UI.formGroup('Applies To', '<select class="form-control"><option>All Items</option><option>Specific Categories</option><option>Specific Items</option><option>New Customers</option></select>')}
          ${UI.formGroup('Min Order Value (₹)', '<input type="number" class="form-control" placeholder="0">')}
          ${UI.formGroup('Max Discount Cap (₹)', '<input type="number" class="form-control" placeholder="No limit">')}
        `, `<button class="btn btn-secondary" onclick="App.closeModal('discountModal')">Cancel</button>
            <button class="btn btn-primary" onclick="App.closeModal('discountModal'); App.showToast('Discount created!','success')"><i class='bx bx-check'></i> Create</button>`);
  },

  'admin-offers': () => {
    return UI.pageHeader('Offers & Promotions', 'Create promotional campaigns and offers',
        `<button class="btn btn-primary"><i class='bx bx-plus'></i> New Offer</button>`)
      + UI.tabs([{ id: 'all', label: 'All Offers' }, { id: 'coupons', label: 'Coupons' }, { id: 'bogo', label: 'Buy X Get Y' }, { id: 'cashback', label: 'Cashback' }, { id: 'loyalty', label: 'Loyalty Rewards' }], 'all')
      + `<div class="grid-3">
          ${[{name:'Summer Mega Sale',type:'Seasonal',discount:'Up to 40% off',period:'Apr 1 - Apr 30',status:'active',uses:'1,250'},
             {name:'BOGO Fridays',type:'Buy 1 Get 1',discount:'Buy 1 Get 1 Free',period:'Every Friday',status:'active',uses:'890'},
             {name:'Flat ₹100 Cashback',type:'Cashback',discount:'₹100 on ₹500+',period:'Mar 15 - Apr 15',status:'active',uses:'456'},
             {name:'NEW200',type:'Coupon',discount:'₹200 off first order',period:'Ongoing',status:'active',uses:'234'},
             {name:'2X Loyalty Points',type:'Loyalty',discount:'Double points on Electronics',period:'Apr 1 - Apr 7',status:'active',uses:'178'},
             {name:'Diwali Bonanza',type:'Festival',discount:'Up to 60% off',period:'Oct 15 - Nov 5',status:'scheduled',uses:'0'}
          ].map(o => `<div class="card" style="cursor:pointer">
            <div class="card-body">
              <div class="flex-between mb-1">
                <span class="badge badge-info">${o.type}</span>
                ${MockData.getStatusBadge(o.status)}
              </div>
              <h3 style="font-size:1rem;margin:.5rem 0 .25rem">${o.name}</h3>
              <p class="text-muted" style="font-size:.85rem">${o.discount}</p>
              <div class="flex-between mt-2" style="font-size:.8rem;color:var(--text-muted)">
                <span><i class='bx bx-calendar'></i> ${o.period}</span>
                <span><i class='bx bx-user'></i> ${o.uses} used</span>
              </div>
            </div>
          </div>`).join('')}
        </div>`;
  },

  'admin-barcode': () => {
    return UI.pageHeader('Barcode & QR Code', 'Generate, print and manage barcodes',
        `<button class="btn btn-secondary"><i class='bx bx-printer'></i> Batch Print</button>
         <button class="btn btn-primary"><i class='bx bx-plus'></i> Generate Barcode</button>`)
      + `<div class="grid-2">
          ${UI.card('Generate Barcode / QR Code', `
            ${UI.formGroup('Item', `<select class="form-control"><option>Select an item</option>${MockData.products.map(p => `<option>${p.name} (${p.sku})</option>`).join('')}</select>`)}
            <div class="form-row">
              ${UI.formGroup('Code Type', '<select class="form-control"><option>Barcode - Code 128</option><option>Barcode - EAN-13</option><option>QR Code</option></select>')}
              ${UI.formGroup('Quantity', '<input type="number" class="form-control" value="1">')}
            </div>
            ${UI.formGroup('Label Size', '<select class="form-control"><option>1×1 inch</option><option>2×1 inch</option><option>3×1 inch</option><option>A4 Sheet</option></select>')}
            <div class="flex gap-1" style="margin-top:1rem">
              <button class="btn btn-secondary"><i class='bx bx-show'></i> Preview</button>
              <button class="btn btn-primary"><i class='bx bx-printer'></i> Print Labels</button>
            </div>
          `)}
          ${UI.card('Barcode Preview', `
            <div style="text-align:center;padding:2rem;background:var(--bg);border-radius:var(--radius)">
              <div style="font-family:monospace;font-size:2rem;letter-spacing:3px;margin-bottom:.5rem">||||||||||||||||||||</div>
              <div style="font-size:.9rem;font-weight:600">EL-SAM-001</div>
              <div style="font-size:.8rem;color:var(--text-muted)">Samsung Galaxy S24 Ultra</div>
              <div style="font-size:1rem;font-weight:700;margin-top:.25rem">₹1,24,999</div>
            </div>
          `)}
        </div>`;
  },

  'admin-reports-sales': () => {
    return UI.pageHeader('Sales Report', 'Analyze sales performance',
        `<button class="btn btn-secondary"><i class='bx bx-download'></i> Export PDF</button>
         <button class="btn btn-secondary"><i class='bx bx-spreadsheet'></i> Export Excel</button>`)
      + `<div class="filter-bar">
          <input type="date" class="form-control" style="width:auto" value="2026-03-01">
          <span class="text-muted">to</span>
          <input type="date" class="form-control" style="width:auto" value="2026-03-31">
          <select class="form-control" style="width:auto"><option>All Categories</option></select>
          <select class="form-control" style="width:auto"><option>All Locations</option></select>
          <button class="btn btn-primary btn-sm"><i class='bx bx-filter-alt'></i> Apply</button>
        </div>`
      + `<div class="stats-grid">
          ${UI.statCard('bx-wallet', 'green', 'Total Revenue', '₹24,56,780', '+12.5%', 'up')}
          ${UI.statCard('bx-receipt', 'blue', 'Total Orders', '1,245', '+8.3%', 'up')}
          ${UI.statCard('bx-trending-up', 'purple', 'Avg Order Value', '₹3,875', '+3.1%', 'up')}
          ${UI.statCard('bx-money', 'teal', 'Tax Collected', '₹3,68,517', '', '')}
        </div>`
      + `<div class="grid-2">
          ${UI.card('Revenue Trend', '<div class="chart-placeholder"><i class="bx bx-line-chart"></i><span>Revenue chart</span></div>')}
          ${UI.card('Sales by Category', '<div class="chart-placeholder"><i class="bx bx-bar-chart-alt-2"></i><span>Category breakdown</span></div>')}
        </div>`
      + `<div class="mt-3">${UI.card('Top Selling Products', UI.dataTable([
            { label: 'Product', render: r => `<span class="fw-600">${r.name}</span>` },
            { label: 'Category', key: 'category' },
            { label: 'Units Sold', render: () => Math.floor(Math.random() * 200 + 50) },
            { label: 'Revenue', render: r => MockData.formatCurrency(r.price * (Math.floor(Math.random() * 200 + 50))) },
            { label: 'Trend', render: () => `<span class="text-success"><i class='bx bx-trending-up'></i> +${(Math.random()*20+1).toFixed(1)}%</span>` }
          ], MockData.products.slice(0, 6)))}</div>`;
  },

  'admin-reports-tax': () => {
    return UI.pageHeader('Tax Report', 'GST/VAT reports and compliance',
        `<button class="btn btn-secondary"><i class='bx bx-download'></i> Download GSTR-1</button>
         <button class="btn btn-primary"><i class='bx bx-file'></i> Generate Return</button>`)
      + UI.tabs([{ id: 'summary', label: 'Tax Summary' }, { id: 'gstr1', label: 'GSTR-1' }, { id: 'gstr3b', label: 'GSTR-3B' }, { id: 'hsn', label: 'HSN Summary' }], 'summary')
      + `<div class="stats-grid">
          ${UI.statCard('bx-calculator', 'blue', 'Total Tax Collected', '₹3,68,517', '', '')}
          ${UI.statCard('bx-right-arrow-alt', 'green', 'CGST', '₹1,52,400', '', '')}
          ${UI.statCard('bx-left-arrow-alt', 'purple', 'SGST', '₹1,52,400', '', '')}
          ${UI.statCard('bx-transfer', 'orange', 'IGST', '₹63,717', '', '')}
        </div>`
      + UI.card('Tax Breakup by Rate', UI.dataTable([
          { label: 'GST Rate', render: r => `<span class="fw-600">${r.name}</span>` },
          { label: 'Taxable Amount', render: () => MockData.formatCurrency(Math.floor(Math.random() * 500000 + 100000)) },
          { label: 'CGST', render: r => MockData.formatCurrency(Math.floor(r.rate / 2 * 5000)) },
          { label: 'SGST', render: r => MockData.formatCurrency(Math.floor(r.rate / 2 * 5000)) },
          { label: 'IGST', render: r => MockData.formatCurrency(Math.floor(r.rate * 1500)) },
          { label: 'Total Tax', render: r => MockData.formatCurrency(Math.floor(r.rate * 10000)) }
        ], MockData.taxRates.filter(t => t.rate > 0)));
  },

  'admin-reports-inventory': () => {
    return UI.pageHeader('Inventory Report', 'Stock analysis and valuation',
        `<button class="btn btn-secondary"><i class='bx bx-download'></i> Export</button>`)
      + `<div class="stats-grid">
          ${UI.statCard('bx-box', 'blue', 'Total Stock Value', '₹1,25,45,000', '', '')}
          ${UI.statCard('bx-package', 'green', 'Total SKUs', '4,635', '', '')}
          ${UI.statCard('bx-error', 'orange', 'Dead Stock', '45 items', 'No sales in 90 days', '')}
          ${UI.statCard('bx-time', 'red', 'Expiring Soon', '25 items', 'Within 30 days', '')}
        </div>`
      + `<div class="grid-2">
          ${UI.card('Stock Value by Category', '<div class="chart-placeholder"><i class="bx bx-bar-chart"></i><span>Stock value chart</span></div>')}
          ${UI.card('Stock Movement Trend', '<div class="chart-placeholder"><i class="bx bx-line-chart"></i><span>Stock in/out trend</span></div>')}
        </div>`;
  },

  'admin-notifications': () => {
    return UI.pageHeader('Notifications', 'Manage notification templates and settings')
      + UI.tabs([{ id: 'all', label: 'All Notifications' }, { id: 'templates', label: 'Templates' }, { id: 'settings', label: 'Settings' }], 'all')
      + `<div class="card">${MockData.notifications.map(n => UI.notifItem(n)).join('')}</div>`
      + `<div class="mt-3">${UI.card('Notification Settings', `
          <div class="settings-section">
            <h3>Email Notifications</h3>
            ${UI.settingsItem('Order Confirmation', 'Send email when order is placed', UI.toggle('notif1', true))}
            ${UI.settingsItem('Payment Receipt', 'Send email on successful payment', UI.toggle('notif2', true))}
            ${UI.settingsItem('Shipping Updates', 'Email when order is shipped/delivered', UI.toggle('notif3', true))}
            ${UI.settingsItem('Low Stock Alert', 'Email when stock falls below reorder level', UI.toggle('notif4', true))}
            ${UI.settingsItem('Promotional Emails', 'Send marketing and promotional emails', UI.toggle('notif5', false))}
          </div>
          <div class="settings-section">
            <h3>SMS Notifications</h3>
            ${UI.settingsItem('OTP Verification', 'Send OTP for login and transactions', UI.toggle('sms1', true))}
            ${UI.settingsItem('Order Status SMS', 'SMS updates for order status changes', UI.toggle('sms2', true))}
            ${UI.settingsItem('Payment Alerts', 'SMS for payment confirmations', UI.toggle('sms3', false))}
          </div>
          <div class="settings-section">
            <h3>Push Notifications</h3>
            ${UI.settingsItem('New Orders', 'Push notification for new orders', UI.toggle('push1', true))}
            ${UI.settingsItem('Customer Messages', 'Push when customer sends a message', UI.toggle('push2', true))}
            ${UI.settingsItem('System Alerts', 'Critical system notifications', UI.toggle('push3', true))}
          </div>
        `)}</div>`;
  },

  'admin-support': () => {
    return UI.pageHeader('Support Tickets', 'Manage customer support requests',
        `<button class="btn btn-primary"><i class='bx bx-plus'></i> Create Ticket</button>`)
      + `<div class="stats-grid">
          ${UI.statCard('bx-message-dots', 'orange', 'Open Tickets', '8', '', '')}
          ${UI.statCard('bx-loader-circle', 'blue', 'In Progress', '5', '', '')}
          ${UI.statCard('bx-check-circle', 'green', 'Resolved Today', '12', '', '')}
          ${UI.statCard('bx-time', 'purple', 'Avg Response', '2.5 hrs', '', '')}
        </div>`
      + UI.filterBar('Search tickets...', [
          { label: 'Priority', options: ['High', 'Medium', 'Low'] },
          { label: 'Status', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
          { label: 'Category', options: ['Delivery', 'Payment', 'Product', 'Offers'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Ticket ID', render: r => `<span class="fw-600 text-primary">${r.id}</span>` },
            { label: 'Subject', render: r => `<span class="fw-600">${r.subject}</span>` },
            { label: 'Customer', key: 'customer' },
            { label: 'Category', render: r => `<span class="badge badge-default">${r.category}</span>` },
            { label: 'Priority', render: r => MockData.getStatusBadge(r.priority) },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Date', render: r => MockData.formatDate(r.date) },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-show'></i></button><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-message-dots'></i></button></div>` }
          ], MockData.tickets)}
        </div></div>`;
  },

  'admin-general-settings': () => {
    return UI.pageHeader('General Settings', 'Configure system-wide settings')
      + UI.tabs([{ id: 'general', label: 'General' }, { id: 'billing', label: 'Billing' }, { id: 'tax', label: 'Tax Config' }, { id: 'delivery', label: 'Delivery' }, { id: 'security', label: 'Security' }], 'general')
      + `<div class="card"><div class="card-body">
          <div class="settings-section">
            <h3>General</h3>
            <p>Basic system configuration</p>
            ${UI.settingsItem('Currency', 'Default currency for all transactions', '<select class="form-control" style="width:150px"><option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option></select>')}
            ${UI.settingsItem('Language', 'Default system language', '<select class="form-control" style="width:150px"><option>English</option><option>Hindi</option><option>Tamil</option></select>')}
            ${UI.settingsItem('Date Format', 'Date display format', '<select class="form-control" style="width:150px"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>')}
            ${UI.settingsItem('Time Zone', 'System time zone', '<select class="form-control" style="width:200px"><option>Asia/Kolkata (IST)</option><option>UTC</option></select>')}
            ${UI.settingsItem('Maintenance Mode', 'Take the system offline for maintenance', UI.toggle('maint', false))}
          </div>
          <div class="settings-section">
            <h3>Invoice Settings</h3>
            <p>Configure invoice generation rules</p>
            ${UI.settingsItem('Invoice Prefix', 'Prefix for invoice numbers', '<input class="form-control" style="width:150px" value="INV-">')}
            ${UI.settingsItem('Auto-Generate Invoice', 'Automatically create invoice on order confirmation', UI.toggle('autoInv', true))}
            ${UI.settingsItem('Invoice Template', 'Default invoice template', '<select class="form-control" style="width:150px"><option>Modern</option><option>Classic</option><option>Minimal</option></select>')}
            ${UI.settingsItem('Digital Signature', 'Include digital signature on invoices', UI.toggle('digSig', true))}
          </div>
          <div class="settings-section">
            <h3>Stock Settings</h3>
            ${UI.settingsItem('Low Stock Threshold', 'Default minimum stock level', '<input type="number" class="form-control" style="width:100px" value="20">')}
            ${UI.settingsItem('Auto Reorder', 'Automatically generate PO when stock is low', UI.toggle('autoReorder', false))}
            ${UI.settingsItem('Expiry Alert Days', 'Days before expiry to send alert', '<input type="number" class="form-control" style="width:100px" value="30">')}
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.5rem">
            <button class="btn btn-secondary">Reset to Default</button>
            <button class="btn btn-primary" onclick="App.showToast('Settings saved!','success')"><i class='bx bx-check'></i> Save Settings</button>
          </div>
        </div></div>`;
  },

  'admin-user-settings': () => {
    return UI.pageHeader('User Management', 'Manage users, roles and permissions',
        `<button class="btn btn-primary"><i class='bx bx-user-plus'></i> Add User</button>`)
      + UI.tabs([{ id: 'users', label: 'Users' }, { id: 'roles', label: 'Roles & Permissions' }, { id: 'activity', label: 'Activity Log' }], 'users')
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'User', render: r => `<div class="flex gap-1" style="align-items:center"><div class="avatar-sm">${r.avatar}</div><div><span class="item-name">${r.name}</span><div class="item-sub">${r.email}</div></div></div>` },
            { label: 'Role', render: r => `<span class="badge badge-primary">${r.role}</span>` },
            { label: 'Status', render: () => MockData.getStatusBadge('active') },
            { label: 'Last Login', render: () => 'Today, 10:30 AM' },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button><button class="btn btn-ghost btn-sm btn-icon text-danger"><i class='bx bx-block'></i></button></div>` }
          ], Object.values(MockData.users))}
        </div></div>`
      + `<div class="mt-3">${UI.card('Roles & Permissions', `
          <div class="grid-3">
            ${['Admin', 'Manager', 'Cashier', 'Inventory Staff', 'Service Provider', 'Customer'].map(role => `
              <div class="card" style="cursor:pointer">
                <div class="card-body">
                  <h4 style="font-size:.95rem;margin-bottom:.5rem">${role}</h4>
                  <p class="text-muted" style="font-size:.8rem">${role === 'Admin' ? 'Full system access' : role === 'Manager' ? 'Orders, inventory, reports' : role === 'Cashier' ? 'POS, billing only' : 'Limited access'}</p>
                  <button class="btn btn-sm btn-ghost mt-1"><i class='bx bx-edit'></i> Edit Permissions</button>
                </div>
              </div>
            `).join('')}
          </div>
        `)}</div>`;
  },

  'admin-configuration': () => {
    return UI.pageHeader('System Configuration', 'Advanced system configuration')
      + UI.tabs([{ id: 'payment', label: 'Payment Gateway' }, { id: 'email', label: 'Email/SMS' }, { id: 'integrations', label: 'Integrations' }, { id: 'api', label: 'API Keys' }], 'payment')
      + `<div class="card"><div class="card-body">
          <div class="settings-section">
            <h3>Payment Gateway Configuration</h3>
            <p>Configure payment processing providers</p>
            ${['Razorpay', 'Stripe', 'PayU', 'PayPal'].map((gw, i) => UI.settingsItem(gw, `${gw} payment integration`, `<div class="flex gap-1">${UI.toggle('pg' + i, i < 2)}<button class="btn btn-sm btn-ghost">Configure</button></div>`)).join('')}
          </div>
          <div class="settings-section">
            <h3>UPI Configuration</h3>
            ${UI.settingsItem('Google Pay', 'Accept Google Pay payments', UI.toggle('upi1', true))}
            ${UI.settingsItem('PhonePe', 'Accept PhonePe payments', UI.toggle('upi2', true))}
            ${UI.settingsItem('Paytm', 'Accept Paytm payments', UI.toggle('upi3', true))}
          </div>
          <div class="settings-section">
            <h3>Email Service</h3>
            ${UI.settingsItem('Email Provider', 'Service for sending emails', '<select class="form-control" style="width:180px"><option>SendGrid</option><option>AWS SES</option><option>Mailgun</option><option>SMTP</option></select>')}
            ${UI.settingsItem('SMS Provider', 'Service for sending SMS', '<select class="form-control" style="width:180px"><option>Twilio</option><option>MSG91</option><option>AWS SNS</option></select>')}
            ${UI.settingsItem('WhatsApp Business', 'WhatsApp messaging integration', UI.toggle('wa', false))}
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.5rem">
            <button class="btn btn-primary" onclick="App.showToast('Configuration saved!','success')"><i class='bx bx-check'></i> Save Configuration</button>
          </div>
        </div></div>`;
  },

  // ==========================================
  // CUSTOMER PAGES
  // ==========================================

  'customer-home': () => {
    return `<div style="margin-bottom:1.5rem">
        <div style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:var(--radius-xl);padding:2rem;color:#fff;position:relative;overflow:hidden">
          <h2 style="font-size:1.5rem;margin-bottom:.5rem">Welcome back, Priya!</h2>
          <p style="opacity:.85;margin-bottom:1rem">Discover amazing deals across all categories</p>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="btn" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)" onclick="App.navigate('customer-search')"><i class='bx bx-search'></i> Browse Products</button>
            <button class="btn" style="background:#fff;color:var(--primary)" onclick="App.navigate('customer-orders')"><i class='bx bx-package'></i> My Orders</button>
          </div>
        </div>
      </div>`
      + `<div class="mb-3">
          <div class="flex-between mb-2"><h2 style="font-size:1.15rem">Shop by Category</h2><a href="#" onclick="App.navigate('customer-search'); return false" style="font-size:.85rem">View All</a></div>
          <div class="grid-4">
            ${MockData.categories.filter(c => c.status === 'active').map(c => `
              <div class="card" style="cursor:pointer;text-align:center;padding:1.25rem" onclick="App.navigate('customer-search')">
                <i class='bx ${c.icon}' style="font-size:2rem;color:var(--primary)"></i>
                <div style="font-weight:500;font-size:.85rem;margin-top:.5rem">${c.name}</div>
                <div class="text-muted" style="font-size:.75rem">${c.items} items</div>
              </div>
            `).join('')}
          </div>
        </div>`
      + `<div class="mb-3">
          <div class="flex-between mb-2"><h2 style="font-size:1.15rem">Featured Products</h2><a href="#" onclick="App.navigate('customer-search'); return false" style="font-size:.85rem">View All</a></div>
          <div class="product-grid">${MockData.products.slice(0, 8).map(p => UI.productCard(p)).join('')}</div>
        </div>`
      + `<div class="mb-3">
          <div class="flex-between mb-2"><h2 style="font-size:1.15rem">Best Deals</h2></div>
          <div class="product-grid">${MockData.products.filter(p => p.mrp > p.price).slice(0, 4).map(p => UI.productCard(p)).join('')}</div>
        </div>`;
  },

  'customer-search': () => {
    return UI.pageHeader('Browse Products', `${MockData.products.length} products found`)
      + `<div class="filter-bar">
          <div class="search-input"><i class='bx bx-search'></i><input type="text" placeholder="Search by name, brand, category..."></div>
          <select class="form-control" style="width:auto"><option>All Categories</option>${MockData.categories.map(c => `<option>${c.name}</option>`).join('')}</select>
          <select class="form-control" style="width:auto"><option>Sort: Relevance</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Rating</option><option>Newest</option></select>
          <button class="btn btn-secondary btn-sm"><i class='bx bx-filter-alt'></i> Filters</button>
        </div>`
      + `<div class="product-grid">${MockData.products.map(p => UI.productCard(p)).join('')}</div>`
      + UI.pagination(1, 3, '1-12 of 36');
  },

  'customer-product': () => {
    const p = MockData.products[0];
    const discount = Math.round((1 - p.price / p.mrp) * 100);
    return `<button class="btn btn-ghost btn-sm mb-2" onclick="App.navigate('customer-search')"><i class='bx bx-arrow-back'></i> Back to results</button>
      <div class="grid-2">
        <div>
          <div class="card"><div class="card-body" style="text-align:center;padding:3rem">
            <i class='bx ${p.img}' style="font-size:6rem;color:var(--text-light)"></i>
            <div class="flex gap-1" style="justify-content:center;margin-top:1rem">
              ${[1,2,3,4].map(i => `<div style="width:60px;height:60px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);display:flex;align-items:center;justify-content:center"><i class='bx ${p.img}' style="font-size:1.5rem;color:var(--text-light)"></i></div>`).join('')}
            </div>
          </div></div>
        </div>
        <div>
          <div class="card"><div class="card-body">
            <span class="badge badge-success mb-1">${discount}% OFF</span>
            <h1 style="font-size:1.35rem;margin:.5rem 0">${p.name}</h1>
            <div style="font-size:.9rem;color:var(--text-muted)">Brand: <span class="fw-600">${p.brand}</span> | SKU: ${p.sku}</div>
            <div class="flex gap-1 mt-1" style="align-items:center">
              ${UI.stars(p.rating)} <span class="text-muted" style="font-size:.85rem">${p.rating} (${p.reviews} reviews)</span>
            </div>
            <div style="margin:1.25rem 0">
              <span style="font-size:2rem;font-weight:700">${MockData.formatCurrency(p.price)}</span>
              <span style="text-decoration:line-through;color:var(--text-muted);margin-left:.5rem;font-size:1.1rem">${MockData.formatCurrency(p.mrp)}</span>
              <span class="text-success fw-600" style="margin-left:.5rem">Save ${MockData.formatCurrency(p.mrp - p.price)}</span>
            </div>
            <div style="font-size:.85rem;color:var(--text-muted)">Inclusive of all taxes | GST ${p.gst}% | HSN: ${p.hsn}</div>
            <div style="margin:1.25rem 0">
              <label style="font-size:.85rem;font-weight:500;display:block;margin-bottom:.35rem">Quantity</label>
              <div class="qty-control"><button>−</button><span>1</span><button>+</button></div>
            </div>
            <div class="flex gap-1 mt-2">
              <button class="btn btn-primary btn-lg" onclick="App.showToast('Added to cart!','success')"><i class='bx bx-cart-add'></i> Add to Cart</button>
              <button class="btn btn-success btn-lg" onclick="App.navigate('customer-checkout')"><i class='bx bx-bolt-circle'></i> Buy Now</button>
              <button class="btn btn-secondary btn-lg btn-icon" onclick="App.showToast('Added to wishlist!','success')"><i class='bx bx-heart'></i></button>
            </div>
            <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">
              <div class="flex gap-2" style="font-size:.85rem;color:var(--text-muted);flex-wrap:wrap">
                <span><i class='bx bx-truck'></i> Free delivery on orders above ₹500</span>
                <span><i class='bx bx-check-shield'></i> ${p.stock > 0 ? `In Stock (${p.stock} available)` : 'Out of Stock'}</span>
                <span><i class='bx bx-undo'></i> 15-day return policy</span>
              </div>
            </div>
          </div></div>
        </div>
      </div>`;
  },

  'customer-cart': () => {
    const items = [MockData.products[0], MockData.products[4], MockData.products[8]];
    const qtys = [1, 3, 5];
    const subtotal = items.reduce((sum, item, i) => sum + item.price * qtys[i], 0);
    const tax = Math.round(subtotal * 0.12);
    return UI.pageHeader('Shopping Cart', `${items.length} items in your cart`)
      + `<div class="cart-layout">
          <div>
            <div class="card">
              ${items.map((item, i) => `<div class="cart-item">
                <div class="cart-item-img"><i class='bx ${item.img}'></i></div>
                <div class="cart-item-details">
                  <div class="name">${item.name}</div>
                  <div class="meta">${item.brand} | ${item.category}</div>
                  <div class="meta">GST: ${item.gst}%</div>
                  <div class="qty-control mt-1"><button>−</button><span>${qtys[i]}</span><button>+</button></div>
                </div>
                <div class="cart-item-right">
                  <div class="price">${MockData.formatCurrency(item.price * qtys[i])}</div>
                  ${item.mrp > item.price ? `<div style="font-size:.8rem;color:var(--text-muted);text-decoration:line-through">${MockData.formatCurrency(item.mrp * qtys[i])}</div>` : ''}
                  <button class="btn btn-ghost btn-sm text-danger" onclick="App.showToast('Item removed','warning')"><i class='bx bx-trash'></i> Remove</button>
                </div>
              </div>`).join('')}
            </div>
          </div>
          <div>
            <div class="card cart-summary">
              <div class="card-header"><h3>Order Summary</h3></div>
              <div class="card-body">
                <div class="summary-row"><span>Subtotal (${items.length} items)</span><span>${MockData.formatCurrency(subtotal)}</span></div>
                <div class="summary-row"><span>Tax (GST)</span><span>${MockData.formatCurrency(tax)}</span></div>
                <div class="summary-row"><span>Delivery</span><span class="text-success">Free</span></div>
                <div class="summary-row"><span>Discount</span><span class="text-success">-${MockData.formatCurrency(Math.round(subtotal * 0.05))}</span></div>
                <div class="summary-row total"><span>Total</span><span>${MockData.formatCurrency(subtotal + tax - Math.round(subtotal * 0.05))}</span></div>
                <div style="margin-top:1rem">
                  <div class="input-group" style="margin-bottom:.75rem">
                    <input class="form-control" placeholder="Apply coupon code">
                    <button class="btn btn-secondary">Apply</button>
                  </div>
                  <button class="btn btn-primary w-full" onclick="App.navigate('customer-checkout')"><i class='bx bx-lock-alt'></i> Proceed to Checkout</button>
                  <button class="btn btn-ghost w-full mt-1" onclick="App.navigate('customer-search')">Continue Shopping</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
  },

  'customer-wishlist': () => {
    const items = MockData.products.slice(3, 7);
    return UI.pageHeader('My Wishlist', `${items.length} items saved`,
        `<button class="btn btn-secondary"><i class='bx bx-share-alt'></i> Share</button>`)
      + (items.length ? `<div class="product-grid">${items.map(p => UI.productCard(p)).join('')}</div>`
        : UI.emptyState('bx-heart', 'Your wishlist is empty', 'Save items you love to your wishlist', '<button class="btn btn-primary" onclick="App.navigate(\'customer-search\')">Browse Products</button>'));
  },

  'customer-checkout': () => {
    return UI.pageHeader('Checkout', 'Complete your purchase')
      + UI.stepper(['Cart', 'Address', 'Payment', 'Confirm'], 1)
      + `<div class="grid-2">
          <div>
            ${UI.card('Delivery Address', `
              <div class="grid-2" style="gap:1rem">
                ${MockData.addresses.map(a => `<div class="address-card ${a.default ? 'default' : ''}" style="cursor:pointer" onclick="this.parentElement.querySelectorAll('.address-card').forEach(c=>c.classList.remove('default'));this.classList.add('default')">
                  ${a.default ? '<span class="default-badge badge badge-primary">Default</span>' : ''}
                  <h4><i class='bx ${a.label === 'Home' ? 'bx-home' : 'bx-building'}'></i> ${a.label}</h4>
                  <p>${a.name}<br>${a.line1}, ${a.line2}<br>${a.city}, ${a.state} - ${a.pin}</p>
                  <div class="text-muted" style="font-size:.8rem"><i class='bx bx-phone'></i> ${a.phone}</div>
                </div>`).join('')}
              </div>
              <button class="btn btn-ghost btn-sm mt-2"><i class='bx bx-plus'></i> Add New Address</button>
            `)}
            <div class="mt-2">${UI.card('Payment Method', `
              <div style="display:flex;flex-direction:column;gap:.75rem">
                ${[
                  { icon: 'bx-qr', name: 'UPI (Google Pay / PhonePe)', desc: 'Pay using any UPI app' },
                  { icon: 'bx-credit-card', name: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                  { icon: 'bx-building', name: 'Net Banking', desc: 'All major banks' },
                  { icon: 'bx-wallet', name: 'Wallets', desc: 'Paytm, Amazon Pay' },
                  { icon: 'bx-money', name: 'Cash on Delivery', desc: 'Pay when you receive' }
                ].map((pm, i) => `<div class="payment-card ${i === 0 ? 'selected' : ''}" onclick="this.parentElement.querySelectorAll('.payment-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')">
                  <i class='bx ${pm.icon}' style="color:var(--primary)"></i>
                  <div><div class="fw-600" style="font-size:.9rem">${pm.name}</div><div class="text-muted" style="font-size:.8rem">${pm.desc}</div></div>
                  <div style="margin-left:auto"><input type="radio" name="payment" ${i === 0 ? 'checked' : ''} style="accent-color:var(--primary)"></div>
                </div>`).join('')}
              </div>
            `)}</div>
          </div>
          <div>
            <div class="card cart-summary">
              <div class="card-header"><h3>Order Summary</h3></div>
              <div class="card-body">
                <div class="summary-row"><span>Items (3)</span><span>₹1,25,984</span></div>
                <div class="summary-row"><span>Tax (GST)</span><span>₹15,118</span></div>
                <div class="summary-row"><span>Delivery</span><span class="text-success">Free</span></div>
                <div class="summary-row"><span>Coupon Discount</span><span class="text-success">-₹6,299</span></div>
                <div class="summary-row total"><span>Total</span><span>₹1,34,803</span></div>
                <button class="btn btn-primary w-full mt-2" onclick="App.navigate('customer-order-confirm')"><i class='bx bx-check-circle'></i> Place Order</button>
                <div class="text-center text-muted mt-1" style="font-size:.8rem"><i class='bx bx-lock-alt'></i> Secured by 256-bit encryption</div>
              </div>
            </div>
          </div>
        </div>`;
  },

  'customer-order-confirm': () => {
    return `<div style="text-align:center;padding:3rem 1rem">
      <div style="width:80px;height:80px;background:var(--success-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem">
        <i class='bx bx-check' style="font-size:3rem;color:var(--success)"></i>
      </div>
      <h1 style="font-size:1.75rem;margin-bottom:.5rem">Order Placed Successfully!</h1>
      <p class="text-muted" style="font-size:1rem;margin-bottom:.5rem">Thank you for your purchase</p>
      <p style="font-size:1.1rem">Order ID: <span class="fw-700 text-primary">ORD-2026-009</span></p>
      <p class="text-muted" style="font-size:.9rem">Estimated delivery: April 3, 2026</p>
      <div style="margin-top:2rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="App.navigate('customer-orders')"><i class='bx bx-package'></i> Track Order</button>
        <button class="btn btn-secondary" onclick="App.navigate('customer-home')"><i class='bx bx-home'></i> Continue Shopping</button>
        <button class="btn btn-secondary"><i class='bx bx-download'></i> Download Invoice</button>
      </div>
    </div>`;
  },

  'customer-orders': () => {
    return UI.pageHeader('My Orders', 'Track and manage your orders')
      + UI.tabs([{ id: 'current', label: 'Current Orders' }, { id: 'past', label: 'Past Orders' }, { id: 'cancelled', label: 'Cancelled' }], 'current')
      + MockData.orders.slice(0, 5).map(o => `<div class="card mb-2" style="cursor:pointer" onclick="App.navigate('customer-order-detail')">
          <div class="card-body">
            <div class="flex-between" style="flex-wrap:wrap;gap:.5rem">
              <div>
                <div class="flex gap-1" style="align-items:center">
                  <span class="fw-600">${o.id}</span>
                  ${MockData.getStatusBadge(o.status)}
                </div>
                <div class="text-muted mt-1" style="font-size:.85rem">${o.items} items · ${MockData.formatDate(o.date)} · ${o.payment}</div>
              </div>
              <div style="text-align:right">
                <div class="fw-700" style="font-size:1.1rem">${MockData.formatCurrency(o.total)}</div>
                <div class="flex gap-1 mt-1">
                  <button class="btn btn-sm btn-secondary"><i class='bx bx-show'></i> Details</button>
                  ${o.status === 'delivered' ? '<button class="btn btn-sm btn-ghost"><i class="bx bx-undo"></i> Return</button>' : ''}
                  ${o.status === 'delivered' ? '<button class="btn btn-sm btn-ghost"><i class="bx bx-refresh"></i> Reorder</button>' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>`).join('');
  },

  'customer-order-detail': () => {
    const o = MockData.orders[1];
    const steps = [
      { title: 'Order Placed', subtitle: 'Mar 29, 2026 · 10:30 AM', icon: 'bx-check' },
      { title: 'Confirmed', subtitle: 'Mar 29, 2026 · 10:35 AM', icon: 'bx-check-circle' },
      { title: 'Processing', subtitle: 'Mar 29, 2026 · 11:00 AM', icon: 'bx-cog' },
      { title: 'Shipped', subtitle: 'Mar 30, 2026 · 2:15 PM', icon: 'bx-truck' },
      { title: 'Out for Delivery', subtitle: 'Estimated: Mar 31, 2026', icon: 'bx-map-pin' },
      { title: 'Delivered', subtitle: '', icon: 'bx-package' }
    ];
    return `<button class="btn btn-ghost btn-sm mb-2" onclick="App.navigate('customer-orders')"><i class='bx bx-arrow-back'></i> Back to orders</button>`
      + UI.pageHeader(`Order ${o.id}`, `Placed on ${MockData.formatDate(o.date)}`,
          `<button class="btn btn-secondary"><i class='bx bx-download'></i> Invoice</button>
           <button class="btn btn-secondary"><i class='bx bx-support'></i> Help</button>`)
      + `<div class="grid-2">
          <div>${UI.card('Order Tracking', UI.timeline(steps, 3))}</div>
          <div>
            ${UI.card('Delivery Info', `
              <div style="font-size:.9rem"><strong>Tracking ID:</strong> SHIP-2026-XYZ123</div>
              <div style="font-size:.9rem;margin-top:.5rem"><strong>Carrier:</strong> Quick Delivery Services</div>
              <div class="map-placeholder mt-2"><i class='bx bx-map'></i><span>Live tracking map</span></div>
            `)}
          </div>
        </div>`
      + `<div class="mt-2">${UI.card('Order Items', `
          <div class="cart-item" style="border:none">
            <div class="cart-item-img"><i class='bx bx-mobile'></i></div>
            <div class="cart-item-details">
              <div class="name">Samsung Galaxy S24 Ultra</div>
              <div class="meta">SKU: EL-SAM-001 · Qty: 1</div>
            </div>
            <div class="cart-item-right"><div class="price">${MockData.formatCurrency(124999)}</div></div>
          </div>
        `)}</div>`
      + `<div class="mt-2">${UI.card('Payment Summary', `
          <div class="summary-row"><span>Subtotal</span><span>${MockData.formatCurrency(124999)}</span></div>
          <div class="summary-row"><span>Tax (GST 18%)</span><span>${MockData.formatCurrency(19067)}</span></div>
          <div class="summary-row"><span>Delivery</span><span class="text-success">Free</span></div>
          <div class="summary-row total"><span>Total Paid</span><span>${MockData.formatCurrency(o.total)}</span></div>
          <div class="text-muted mt-1" style="font-size:.85rem">Paid via ${o.payment}</div>
        `)}</div>`;
  },

  'customer-delivery-tracking': () => {
    return UI.pageHeader('Delivery Tracking', 'Real-time order tracking')
      + `<div class="grid-2">
          <div>
            <div class="map-placeholder" style="height:400px"><i class='bx bx-map'></i><span>Live delivery tracking map<br>Shows real-time location of delivery partner</span></div>
          </div>
          <div>
            ${UI.card('Delivery Details', `
              <div style="font-size:.9rem">
                <div class="flex-between mb-1"><span class="text-muted">Order ID</span><span class="fw-600">ORD-2026-002</span></div>
                <div class="flex-between mb-1"><span class="text-muted">Tracking ID</span><span class="fw-600">SHIP-2026-XYZ123</span></div>
                <div class="flex-between mb-1"><span class="text-muted">Carrier</span><span>Quick Delivery Services</span></div>
                <div class="flex-between mb-1"><span class="text-muted">Driver</span><span>Raj Kumar · 98765 43220</span></div>
                <div class="flex-between"><span class="text-muted">ETA</span><span class="fw-600 text-primary">Today, 4:30 PM</span></div>
              </div>
            `)}
            <div class="mt-2">${UI.card('Status Updates', UI.timeline([
              { title: 'Picked up from warehouse', subtitle: '2:15 PM', icon: 'bx-package' },
              { title: 'In transit to your area', subtitle: '3:00 PM', icon: 'bx-truck' },
              { title: 'Out for delivery', subtitle: '3:45 PM', icon: 'bx-map-pin' },
              { title: 'Arriving soon', subtitle: 'ETA: 4:30 PM', icon: 'bx-home' }
            ], 2))}</div>
          </div>
        </div>`;
  },

  'customer-invoices': () => {
    return UI.pageHeader('My Invoices', 'View and download your invoices')
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Invoice #', render: r => `<span class="fw-600 text-primary">${r.id}</span>` },
            { label: 'Order', key: 'order' },
            { label: 'Amount', render: r => `<span class="fw-600">${MockData.formatCurrency(r.amount)}</span>` },
            { label: 'Date', render: r => MockData.formatDate(r.date) },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Actions', render: () => `<div class="table-actions">
              <button class="btn btn-sm btn-secondary"><i class='bx bx-show'></i> View</button>
              <button class="btn btn-sm btn-ghost"><i class='bx bx-download'></i></button>
              <button class="btn btn-sm btn-ghost"><i class='bx bx-printer'></i></button>
            </div>` }
          ], MockData.invoices.filter(i => i.customer === 'Priya Sharma'))}
        </div></div>`;
  },

  'customer-profile': () => {
    const u = MockData.users.customer;
    return UI.pageHeader('My Profile', 'Manage your personal information')
      + `<div class="grid-2">
          <div>
            ${UI.card('Personal Information', `
              <div style="text-align:center;margin-bottom:1.5rem">
                <div style="width:80px;height:80px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;margin:0 auto">${u.avatar}</div>
                <h3 style="margin-top:.75rem">${u.name}</h3>
                <p class="text-muted">${u.email}</p>
                <span class="badge badge-warning">Gold Member</span>
              </div>
              <div class="form-row">
                ${UI.formGroup('First Name', '<input class="form-control" value="Priya">')}
                ${UI.formGroup('Last Name', '<input class="form-control" value="Sharma">')}
              </div>
              ${UI.formGroup('Email', '<input class="form-control" value="priya@customer.com">')}
              ${UI.formGroup('Phone', '<input class="form-control" value="+91 98765 43210">')}
              <div class="form-row">
                ${UI.formGroup('Date of Birth', '<input type="date" class="form-control" value="1995-06-15">')}
                ${UI.formGroup('Gender', '<select class="form-control"><option>Female</option><option>Male</option><option>Other</option></select>')}
              </div>
              <button class="btn btn-primary mt-2" onclick="App.showToast('Profile updated!','success')"><i class='bx bx-check'></i> Update Profile</button>
            `)}
          </div>
          <div>
            ${UI.card('Loyalty Points', `
              <div style="text-align:center;padding:1rem">
                <div style="font-size:2.5rem;font-weight:700;color:var(--primary)">2,450</div>
                <div class="text-muted">Available Points</div>
                <div style="margin-top:1rem;font-size:.85rem">
                  <div class="flex-between" style="padding:.35rem 0"><span>Points earned this month</span><span class="text-success">+450</span></div>
                  <div class="flex-between" style="padding:.35rem 0"><span>Points redeemed</span><span class="text-danger">-200</span></div>
                  <div class="flex-between" style="padding:.35rem 0"><span>Points expiring soon</span><span class="text-warning">150</span></div>
                </div>
                <button class="btn btn-secondary mt-2 w-full">View Points History</button>
              </div>
            `)}
            <div class="mt-2">${UI.card('Security', `
              ${UI.settingsItem('Change Password', 'Update your password', '<button class="btn btn-sm btn-secondary">Change</button>')}
              ${UI.settingsItem('Two-Factor Auth', 'Add extra security to your account', UI.toggle('cust2fa', false))}
              ${UI.settingsItem('Login Sessions', 'Manage active sessions', '<button class="btn btn-sm btn-secondary">View</button>')}
            `)}</div>
          </div>
        </div>`;
  },

  'customer-addresses': () => {
    return UI.pageHeader('My Addresses', 'Manage delivery addresses',
        `<button class="btn btn-primary" onclick="App.openModal('addressModal')"><i class='bx bx-plus'></i> Add Address</button>`)
      + `<div class="grid-2">
          ${MockData.addresses.map(a => `<div class="address-card ${a.default ? 'default' : ''}">
            ${a.default ? '<span class="default-badge badge badge-primary">Default</span>' : ''}
            <h4><i class='bx ${a.label === 'Home' ? 'bx-home' : 'bx-building'}'></i> ${a.label}</h4>
            <p><strong>${a.name}</strong><br>${a.line1}<br>${a.line2}<br>${a.city}, ${a.state} - ${a.pin}</p>
            <div class="text-muted" style="font-size:.85rem"><i class='bx bx-phone'></i> ${a.phone}</div>
            <div class="actions">
              <button class="btn btn-sm btn-secondary"><i class='bx bx-edit'></i> Edit</button>
              <button class="btn btn-sm btn-ghost text-danger"><i class='bx bx-trash'></i> Delete</button>
              ${!a.default ? '<button class="btn btn-sm btn-ghost">Set Default</button>' : ''}
            </div>
          </div>`).join('')}
        </div>`
      + UI.modal('addressModal', 'Add New Address', `
          <div class="form-row">${UI.formGroup('Full Name', '<input class="form-control" placeholder="Recipient name">')}${UI.formGroup('Phone', '<input class="form-control" placeholder="+91...">')}</div>
          ${UI.formGroup('Address Label', '<select class="form-control"><option>Home</option><option>Office</option><option>Other</option></select>')}
          ${UI.formGroup('Address Line 1', '<input class="form-control" placeholder="House/Flat, Street...">')}
          ${UI.formGroup('Address Line 2', '<input class="form-control" placeholder="Area, Locality...">')}
          ${UI.formGroup('Landmark', '<input class="form-control" placeholder="Near...">')}
          <div class="form-row-3">
            ${UI.formGroup('PIN Code', '<input class="form-control" placeholder="560001">')}
            ${UI.formGroup('City', '<input class="form-control" placeholder="City">')}
            ${UI.formGroup('State', '<select class="form-control"><option>Karnataka</option><option>Tamil Nadu</option><option>Maharashtra</option></select>')}
          </div>
        `, `<button class="btn btn-secondary" onclick="App.closeModal('addressModal')">Cancel</button>
            <button class="btn btn-primary" onclick="App.closeModal('addressModal'); App.showToast('Address saved!','success')"><i class='bx bx-check'></i> Save</button>`, 'modal-lg');
  },

  'customer-payment-methods': () => {
    return UI.pageHeader('Payment Methods', 'Manage your saved payment methods',
        `<button class="btn btn-primary"><i class='bx bx-plus'></i> Add Card</button>`)
      + `<div class="grid-2">
          ${[
            { type: 'Visa', last4: '4532', expiry: '12/28', name: 'Priya Sharma', default: true },
            { type: 'MasterCard', last4: '8765', expiry: '06/27', name: 'Priya Sharma', default: false }
          ].map(card => `<div class="card ${card.default ? '' : ''}">
            <div class="card-body">
              <div class="flex-between">
                <span class="fw-600">${card.type}</span>
                ${card.default ? '<span class="badge badge-primary">Default</span>' : ''}
              </div>
              <div style="font-size:1.25rem;font-weight:600;margin:1rem 0;letter-spacing:2px">•••• •••• •••• ${card.last4}</div>
              <div class="flex-between text-muted" style="font-size:.85rem">
                <span>${card.name}</span><span>Exp: ${card.expiry}</span>
              </div>
              <div class="flex gap-1 mt-2">
                <button class="btn btn-sm btn-secondary"><i class='bx bx-edit'></i> Edit</button>
                <button class="btn btn-sm btn-ghost text-danger"><i class='bx bx-trash'></i> Remove</button>
              </div>
            </div>
          </div>`).join('')}
        </div>`
      + `<div class="mt-3">${UI.card('UPI IDs', `
          <div class="flex-between" style="padding:.5rem 0;border-bottom:1px solid var(--border-light)">
            <div class="flex gap-1" style="align-items:center"><i class='bx bx-qr' style="font-size:1.25rem;color:var(--primary)"></i><span class="fw-600">priya@upi</span></div>
            <button class="btn btn-sm btn-ghost text-danger"><i class='bx bx-trash'></i></button>
          </div>
        `)}</div>`;
  },

  'customer-support': () => {
    return UI.pageHeader('Help & Support', 'Get help with your orders and account')
      + `<div class="grid-3 mb-3">
          ${[
            { icon: 'bx-message-dots', title: 'Live Chat', desc: 'Chat with our team', action: 'Start Chat' },
            { icon: 'bx-phone', title: 'Call Us', desc: '+91 1800-123-456', action: 'Call Now' },
            { icon: 'bx-envelope', title: 'Email Support', desc: 'support@billflow.com', action: 'Send Email' }
          ].map(s => `<div class="card" style="text-align:center">
            <div class="card-body">
              <i class='bx ${s.icon}' style="font-size:2.5rem;color:var(--primary)"></i>
              <h3 style="font-size:1rem;margin:.75rem 0 .25rem">${s.title}</h3>
              <p class="text-muted" style="font-size:.85rem">${s.desc}</p>
              <button class="btn btn-primary btn-sm mt-2">${s.action}</button>
            </div>
          </div>`).join('')}
        </div>`
      + UI.card('Frequently Asked Questions', `
          ${['How do I track my order?', 'What is the return policy?', 'How to apply a coupon code?', 'When will I receive my refund?', 'How to change delivery address?'].map((q, i) => `
            <div style="padding:.875rem 0;border-bottom:1px solid var(--border-light);cursor:pointer" onclick="this.querySelector('.faq-answer').style.display=this.querySelector('.faq-answer').style.display==='none'?'block':'none'">
              <div class="flex-between"><span class="fw-600" style="font-size:.9rem">${q}</span><i class='bx bx-chevron-down'></i></div>
              <div class="faq-answer text-muted" style="font-size:.85rem;margin-top:.5rem;display:none">This is a demo answer for the FAQ question. In the actual application, this would contain detailed help content.</div>
            </div>
          `).join('')}
        `)
      + `<div class="mt-3">${UI.card('My Tickets', UI.dataTable([
          { label: 'Ticket', render: r => `<span class="fw-600">${r.id}</span>` },
          { label: 'Subject', key: 'subject' },
          { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
          { label: 'Date', render: r => MockData.formatDate(r.date) },
          { label: 'Actions', render: () => '<button class="btn btn-sm btn-secondary">View</button>' }
        ], MockData.tickets.filter(t => t.customer === 'Priya Sharma')))}</div>`;
  },

  'customer-notifications': () => {
    return UI.pageHeader('Notifications', '',
        `<button class="btn btn-ghost btn-sm">Mark all as read</button>`)
      + `<div class="card">${MockData.notifications.map(n => UI.notifItem(n)).join('')}</div>`;
  },

  'customer-settings': () => {
    return UI.pageHeader('Settings', 'Manage your preferences')
      + `<div class="card"><div class="card-body">
          <div class="settings-section">
            <h3>Preferences</h3>
            ${UI.settingsItem('Language', 'Choose your preferred language', '<select class="form-control" style="width:150px"><option>English</option><option>Hindi</option><option>Tamil</option></select>')}
            ${UI.settingsItem('Currency', 'Display currency', '<select class="form-control" style="width:120px"><option>₹ INR</option><option>$ USD</option></select>')}
            ${UI.settingsItem('Dark Mode', 'Switch to dark theme', UI.toggle('darkMode', false))}
          </div>
          <div class="settings-section">
            <h3>Notifications</h3>
            ${UI.settingsItem('Email Notifications', 'Receive updates via email', UI.toggle('custEmail', true))}
            ${UI.settingsItem('SMS Notifications', 'Receive SMS alerts', UI.toggle('custSms', true))}
            ${UI.settingsItem('Push Notifications', 'Browser and app push', UI.toggle('custPush', true))}
            ${UI.settingsItem('Promotional', 'Offers and deals', UI.toggle('custPromo', false))}
          </div>
          <div class="settings-section">
            <h3>Privacy</h3>
            ${UI.settingsItem('Profile Visibility', 'Show profile to others', UI.toggle('profVis', true))}
            ${UI.settingsItem('Order History', 'Allow order data for recommendations', UI.toggle('orderHist', true))}
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.5rem">
            <button class="btn btn-primary" onclick="App.showToast('Settings saved!','success')"><i class='bx bx-check'></i> Save Settings</button>
          </div>
        </div></div>`;
  },

  'customer-reviews': () => {
    return UI.pageHeader('My Reviews', 'Reviews you\'ve written')
      + MockData.products.slice(0, 3).map(p => `<div class="card mb-2"><div class="card-body">
          <div class="flex-between" style="flex-wrap:wrap;gap:.5rem">
            <div class="flex gap-1" style="align-items:center">
              <div class="stat-icon indigo" style="width:48px;height:48px;border-radius:8px"><i class='bx ${p.img}'></i></div>
              <div>
                <div class="fw-600">${p.name}</div>
                <div class="text-muted" style="font-size:.8rem">${p.brand}</div>
              </div>
            </div>
            <div>${UI.stars(Math.floor(Math.random() * 2 + 3.5))}</div>
          </div>
          <p style="font-size:.9rem;margin-top:.75rem;color:var(--text-secondary)">Great product! Exactly what I expected. Good quality and fast delivery. Would recommend to others.</p>
          <div class="text-muted mt-1" style="font-size:.8rem">Posted on ${MockData.formatDate('2026-03-' + (20 + Math.floor(Math.random() * 10)))}</div>
        </div></div>`).join('');
  },

  // ==========================================
  // SERVICE PROVIDER PAGES
  // ==========================================

  'provider-dashboard': () => {
    const e = MockData.providerEarnings;
    return UI.pageHeader('Provider Dashboard', 'Welcome back, Raj Kumar!')
      + `<div class="stats-grid">
          ${UI.statCard('bx-wallet', 'green', 'Total Earnings', MockData.formatCurrency(e.totalEarnings), '+15.2%', 'up')}
          ${UI.statCard('bx-calendar', 'blue', 'This Month', MockData.formatCurrency(e.thisMonth), '', '')}
          ${UI.statCard('bx-time', 'orange', 'Pending Payout', MockData.formatCurrency(e.pending), '', '')}
          ${UI.statCard('bx-package', 'purple', 'Active Orders', '12', '', '')}
        </div>`
      + `<div class="grid-2">
          ${UI.card('Earnings Overview', '<div class="chart-placeholder"><i class="bx bx-line-chart"></i><span>Monthly earnings chart</span></div>')}
          ${UI.card('Order Status', '<div class="chart-placeholder"><i class="bx bx-pie-chart-alt-2"></i><span>Order status breakdown</span></div>')}
        </div>`
      + `<div class="mt-3">${UI.card('Recent Orders',
          UI.dataTable([
            { label: 'Order ID', render: r => `<span class="fw-600">${r.id}</span>` },
            { label: 'Customer', key: 'customer' },
            { label: 'Items', key: 'items' },
            { label: 'Total', render: r => MockData.formatCurrency(r.total) },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Actions', render: r => `<div class="table-actions">
              <button class="btn btn-sm btn-secondary">View</button>
              ${r.status === 'pending' ? '<button class="btn btn-sm btn-primary">Accept</button>' : ''}
            </div>` }
          ], MockData.orders.slice(0, 5)),
          '<button class="btn btn-sm btn-secondary" onclick="App.navigate(\'provider-orders\')">View All</button>'
        )}</div>`;
  },

  'provider-orders': () => {
    return UI.pageHeader('Order Management', 'Manage incoming and active orders')
      + UI.tabs([
          { id: 'new', label: 'New (3)' }, { id: 'active', label: 'Active (8)' },
          { id: 'completed', label: 'Completed' }, { id: 'cancelled', label: 'Cancelled' }
        ], 'new')
      + UI.filterBar('Search orders...', [{ label: 'Status', options: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Order ID', render: r => `<span class="fw-600">${r.id}</span>` },
            { label: 'Customer', key: 'customer' },
            { label: 'Items', key: 'items' },
            { label: 'Total', render: r => `<span class="fw-600">${MockData.formatCurrency(r.total)}</span>` },
            { label: 'Payment', key: 'payment' },
            { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
            { label: 'Date', render: r => MockData.formatDate(r.date) },
            { label: 'Actions', render: r => `<div class="table-actions">
              <button class="btn btn-sm btn-secondary">View</button>
              ${r.status === 'pending' ? '<button class="btn btn-sm btn-success">Accept</button><button class="btn btn-sm btn-danger">Reject</button>' : ''}
              ${r.status === 'confirmed' || r.status === 'processing' ? '<button class="btn btn-sm btn-primary">Update Status</button>' : ''}
            </div>` }
          ], MockData.orders)}
        </div></div>` + UI.pagination();
  },

  'provider-products': () => {
    return UI.pageHeader('My Products', 'Manage your product catalog',
        `<button class="btn btn-primary" onclick="App.navigate('admin-item-add')"><i class='bx bx-plus'></i> Add Product</button>`)
      + UI.filterBar('Search products...', [{ label: 'Category', options: MockData.categories.map(c => c.name) }, { label: 'Stock', options: ['In Stock', 'Low Stock', 'Out of Stock'] }])
      + `<div class="card"><div class="card-body" style="padding:0">
          ${UI.dataTable([
            { label: 'Product', render: r => `<div class="flex gap-1" style="align-items:center"><div class="stat-icon indigo" style="width:36px;height:36px;border-radius:8px;font-size:1rem"><i class='bx ${r.img}'></i></div><div><span class="item-name">${r.name}</span><div class="item-sub">${r.sku}</div></div></div>` },
            { label: 'Price', render: r => MockData.formatCurrency(r.price) },
            { label: 'Stock', render: r => r.stock },
            { label: 'Status', render: r => r.stock > 0 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>' },
            { label: 'Actions', render: () => `<div class="table-actions"><button class="btn btn-ghost btn-sm btn-icon"><i class='bx bx-edit'></i></button><button class="btn btn-ghost btn-sm btn-icon text-danger"><i class='bx bx-trash'></i></button></div>` }
          ], MockData.products.slice(0, 6))}
        </div></div>`;
  },

  'provider-earnings': () => {
    const e = MockData.providerEarnings;
    return UI.pageHeader('Earnings & Settlements', 'Track your income and payouts',
        `<button class="btn btn-secondary"><i class='bx bx-download'></i> Download Statement</button>`)
      + `<div class="stats-grid">
          ${UI.statCard('bx-wallet', 'green', 'Total Earnings', MockData.formatCurrency(e.totalEarnings), '', '')}
          ${UI.statCard('bx-calendar', 'blue', 'This Month', MockData.formatCurrency(e.thisMonth), '', '')}
          ${UI.statCard('bx-time', 'orange', 'Pending', MockData.formatCurrency(e.pending), '', '')}
          ${UI.statCard('bx-check-circle', 'purple', 'Last Payout', MockData.formatCurrency(e.lastPayout), MockData.formatDate(e.payoutDate), '')}
        </div>`
      + UI.card('Earnings Chart', '<div class="chart-placeholder"><i class="bx bx-bar-chart"></i><span>Monthly earnings breakdown</span></div>')
      + `<div class="mt-3">${UI.card('Payout History', UI.dataTable([
          { label: 'Date', render: () => MockData.formatDate('2026-03-' + (Math.floor(Math.random() * 25) + 1)) },
          { label: 'Amount', render: () => `<span class="fw-600">${MockData.formatCurrency(Math.floor(Math.random() * 30000 + 5000))}</span>` },
          { label: 'Method', render: () => 'Bank Transfer' },
          { label: 'Reference', render: () => `TXN${Math.random().toString(36).substr(2, 8).toUpperCase()}` },
          { label: 'Status', render: () => MockData.getStatusBadge('paid') }
        ], [{},{},{},{},{}]))}</div>`;
  },

  'provider-reviews': () => {
    return UI.pageHeader('Customer Reviews', 'Reviews from your customers')
      + `<div class="stats-grid">
          ${UI.statCard('bx-star', 'orange', 'Overall Rating', '4.5 / 5', '', '')}
          ${UI.statCard('bx-message-dots', 'blue', 'Total Reviews', '234', '', '')}
          ${UI.statCard('bx-like', 'green', '5-Star Reviews', '156 (67%)', '', '')}
          ${UI.statCard('bx-dislike', 'red', '1-Star Reviews', '8 (3%)', '', '')}
        </div>`
      + MockData.products.slice(0, 4).map(p => `<div class="card mb-2"><div class="card-body">
          <div class="flex-between" style="flex-wrap:wrap;gap:.75rem">
            <div>
              <div class="flex gap-1 mb-1" style="align-items:center">
                <div class="avatar-sm">${MockData.customers[Math.floor(Math.random()*3)].name.split(' ').map(n=>n[0]).join('')}</div>
                <span class="fw-600">${MockData.customers[Math.floor(Math.random()*3)].name}</span>
                ${UI.stars(Math.floor(Math.random()*2+3.5))}
              </div>
              <div style="font-size:.85rem;color:var(--text-muted)">Product: ${p.name}</div>
            </div>
            <button class="btn btn-sm btn-secondary"><i class='bx bx-reply'></i> Reply</button>
          </div>
          <p style="font-size:.9rem;margin-top:.75rem">Excellent quality and quick shipping. The product meets all expectations. Happy with the purchase!</p>
          <div class="text-muted mt-1" style="font-size:.8rem">${MockData.formatDate('2026-03-' + (20 + Math.floor(Math.random()*10)))}</div>
        </div></div>`).join('');
  },

  'provider-support': () => {
    return UI.pageHeader('Support Center', 'Get help and manage issues')
      + `<div class="grid-3 mb-3">
          ${[
            { icon: 'bx-message-dots', title: 'Chat Support', desc: 'Available 24/7' },
            { icon: 'bx-phone', title: 'Provider Helpline', desc: '1800-123-789' },
            { icon: 'bx-book-open', title: 'Knowledge Base', desc: 'FAQs & guides' }
          ].map(s => `<div class="card" style="text-align:center;cursor:pointer"><div class="card-body">
            <i class='bx ${s.icon}' style="font-size:2rem;color:var(--primary)"></i>
            <h4 style="margin:.5rem 0 .15rem;font-size:.95rem">${s.title}</h4>
            <p class="text-muted" style="font-size:.8rem">${s.desc}</p>
          </div></div>`).join('')}
        </div>`
      + UI.card('My Support Tickets', UI.dataTable([
          { label: 'Ticket', render: r => `<span class="fw-600">${r.id}</span>` },
          { label: 'Subject', key: 'subject' },
          { label: 'Priority', render: r => MockData.getStatusBadge(r.priority) },
          { label: 'Status', render: r => MockData.getStatusBadge(r.status) },
          { label: 'Actions', render: () => '<button class="btn btn-sm btn-secondary">View</button>' }
        ], MockData.tickets.slice(0, 2)));
  },

  'provider-settings': () => {
    return UI.pageHeader('Settings', 'Manage your provider account')
      + UI.tabs([{ id: 'profile', label: 'Business Profile' }, { id: 'bank', label: 'Bank Details' }, { id: 'notifications', label: 'Notifications' }, { id: 'service', label: 'Service Area' }], 'profile')
      + `<div class="card"><div class="card-body">
          <div class="form-row">
            ${UI.formGroup('Business Name', '<input class="form-control" value="Quick Delivery Services">')}
            ${UI.formGroup('Contact Person', '<input class="form-control" value="Raj Kumar">')}
          </div>
          <div class="form-row">
            ${UI.formGroup('Phone', '<input class="form-control" value="+91 98765 43220">')}
            ${UI.formGroup('Email', '<input class="form-control" value="raj@provider.com">')}
          </div>
          ${UI.formGroup('Business Address', '<textarea class="form-control" rows="2">456 Service Lane, Bangalore</textarea>')}
          <div class="form-row">
            ${UI.formGroup('GSTIN', '<input class="form-control" value="29XYZAB1234C1Z6">')}
            ${UI.formGroup('PAN', '<input class="form-control" value="XYZAB1234C">')}
          </div>
          <h3 style="margin:1.5rem 0 1rem;font-size:1rem;">Service Configuration</h3>
          ${UI.settingsItem('Accept New Orders', 'Enable to receive new orders', UI.toggle('provAccept', true))}
          ${UI.settingsItem('Service Status', 'Your current service status', '<select class="form-control" style="width:140px"><option>Online</option><option>Offline</option><option>Paused</option></select>')}
          ${UI.settingsItem('Max Active Orders', 'Maximum concurrent orders', '<input type="number" class="form-control" style="width:80px" value="10">')}
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.5rem">
            <button class="btn btn-primary" onclick="App.showToast('Settings saved!','success')"><i class='bx bx-check'></i> Save Changes</button>
          </div>
        </div></div>`;
  }
};
