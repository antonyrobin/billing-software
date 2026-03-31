// ============================================
// BillFlow - Mock Data Module
// ============================================

const MockData = {
  // --- Company ---
  company: {
    name: 'BillFlow Retail Pvt Ltd',
    tradeName: 'BillFlow Mart',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    phone: '+91 98765 43210',
    email: 'admin@billflow.com',
    website: 'www.billflow.com',
    address: '123 Business Park, MG Road, Bangalore, Karnataka - 560001',
    logo: null,
    businessType: 'Pvt Ltd',
    industry: 'Retail',
    fssai: 'FSSAI12345678901',
    drugLicense: ''
  },

  // --- Users ---
  users: {
    admin: { name: 'Antony Robin', email: 'admin@billflow.com', role: 'Admin', avatar: 'AR' },
    provider: { name: 'Raj Kumar', email: 'raj@provider.com', role: 'Service Provider', avatar: 'RK' },
    customer: { name: 'Priya Sharma', email: 'priya@customer.com', role: 'Customer', avatar: 'PS' }
  },

  // --- Categories ---
  categories: [
    { id: 1, name: 'Food & Beverages', icon: 'bx-food-menu', items: 245, status: 'active' },
    { id: 2, name: 'Grocery & FMCG', icon: 'bx-cart', items: 1820, status: 'active' },
    { id: 3, name: 'Medicine & Pharma', icon: 'bx-capsule', items: 560, status: 'active' },
    { id: 4, name: 'Clothes & Apparel', icon: 'bx-closet', items: 890, status: 'active' },
    { id: 5, name: 'Electronics', icon: 'bx-devices', items: 340, status: 'active' },
    { id: 6, name: 'Furniture', icon: 'bx-chair', items: 120, status: 'active' },
    { id: 7, name: 'Hardware & Tools', icon: 'bx-wrench', items: 450, status: 'active' },
    { id: 8, name: 'Stationery', icon: 'bx-pen', items: 210, status: 'inactive' }
  ],

  // --- Brands ---
  brands: [
    { id: 1, name: 'Samsung', category: 'Electronics', items: 45, status: 'active' },
    { id: 2, name: 'Apple', category: 'Electronics', items: 32, status: 'active' },
    { id: 3, name: 'Nike', category: 'Apparel', items: 78, status: 'active' },
    { id: 4, name: 'Amul', category: 'Grocery', items: 56, status: 'active' },
    { id: 5, name: 'Cipla', category: 'Pharma', items: 120, status: 'active' },
    { id: 6, name: 'ITC', category: 'FMCG', items: 89, status: 'active' },
    { id: 7, name: 'Godrej', category: 'Home', items: 34, status: 'active' },
    { id: 8, name: 'Bosch', category: 'Hardware', items: 67, status: 'active' }
  ],

  // --- Tax Rates ---
  taxRates: [
    { id: 1, name: 'GST 0%', rate: 0, type: 'GST', hsn: 'Various', status: 'active' },
    { id: 2, name: 'GST 5%', rate: 5, type: 'GST', hsn: '0901-0902', status: 'active' },
    { id: 3, name: 'GST 12%', rate: 12, type: 'GST', hsn: '1001-1006', status: 'active' },
    { id: 4, name: 'GST 18%', rate: 18, type: 'GST', hsn: '3001-3304', status: 'active' },
    { id: 5, name: 'GST 28%', rate: 28, type: 'GST', hsn: '8501-8544', status: 'active' },
    { id: 6, name: 'Cess 1%', rate: 1, type: 'Cess', hsn: 'Various', status: 'active' }
  ],

  // --- UOM ---
  uoms: [
    { id: 1, name: 'Piece', code: 'PCS', type: 'Count' },
    { id: 2, name: 'Kilogram', code: 'KG', type: 'Weight' },
    { id: 3, name: 'Gram', code: 'GM', type: 'Weight' },
    { id: 4, name: 'Litre', code: 'LTR', type: 'Volume' },
    { id: 5, name: 'Millilitre', code: 'ML', type: 'Volume' },
    { id: 6, name: 'Metre', code: 'MTR', type: 'Length' },
    { id: 7, name: 'Box', code: 'BOX', type: 'Pack' },
    { id: 8, name: 'Dozen', code: 'DZN', type: 'Pack' }
  ],

  // --- Products ---
  products: [
    { id: 1, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Electronics', sku: 'EL-SAM-001', mrp: 134999, price: 124999, stock: 25, gst: 18, hsn: '8517', img: 'bx-mobile', rating: 4.5, reviews: 1250 },
    { id: 2, name: 'Organic Basmati Rice 5kg', brand: 'India Gate', category: 'Grocery', sku: 'GR-IG-001', mrp: 850, price: 749, stock: 150, gst: 5, hsn: '1006', img: 'bx-bowl-rice', rating: 4.2, reviews: 340 },
    { id: 3, name: 'Paracetamol 500mg (10 Tab)', brand: 'Cipla', category: 'Medicine', sku: 'MD-CIP-001', mrp: 35, price: 28, stock: 500, gst: 12, hsn: '3004', img: 'bx-capsule', rating: 4.0, reviews: 890 },
    { id: 4, name: 'Nike Air Max Running Shoes', brand: 'Nike', category: 'Apparel', sku: 'AP-NK-001', mrp: 12995, price: 9499, stock: 40, gst: 18, hsn: '6404', img: 'bx-run', rating: 4.7, reviews: 456 },
    { id: 5, name: 'Amul Butter 500g', brand: 'Amul', category: 'Grocery', sku: 'GR-AM-001', mrp: 280, price: 265, stock: 200, gst: 5, hsn: '0405', img: 'bx-food-menu', rating: 4.8, reviews: 2100 },
    { id: 6, name: 'Bosch Drill Machine GSB 600', brand: 'Bosch', category: 'Hardware', sku: 'HW-BS-001', mrp: 4999, price: 3799, stock: 30, gst: 18, hsn: '8467', img: 'bx-wrench', rating: 4.3, reviews: 178 },
    { id: 7, name: 'Apple MacBook Air M3', brand: 'Apple', category: 'Electronics', sku: 'EL-AP-001', mrp: 114900, price: 109900, stock: 15, gst: 18, hsn: '8471', img: 'bx-laptop', rating: 4.9, reviews: 670 },
    { id: 8, name: 'Godrej Interio Office Chair', brand: 'Godrej', category: 'Furniture', sku: 'FR-GD-001', mrp: 15999, price: 12999, stock: 20, gst: 18, hsn: '9401', img: 'bx-chair', rating: 4.1, reviews: 95 },
    { id: 9, name: 'ITC Sunfeast Dark Fantasy', brand: 'ITC', category: 'Food & Beverages', sku: 'FD-ITC-001', mrp: 40, price: 38, stock: 800, gst: 5, hsn: '1905', img: 'bx-cookie', rating: 4.4, reviews: 3200 },
    { id: 10, name: 'Cotton Casual Shirt', brand: 'Allen Solly', category: 'Apparel', sku: 'AP-AS-001', mrp: 2499, price: 1799, stock: 65, gst: 5, hsn: '6205', img: 'bx-closet', rating: 4.0, reviews: 215 },
    { id: 11, name: 'Himalaya Face Wash 150ml', brand: 'Himalaya', category: 'Grocery', sku: 'GR-HM-001', mrp: 199, price: 175, stock: 300, gst: 18, hsn: '3401', img: 'bx-droplet', rating: 4.3, reviews: 1680 },
    { id: 12, name: 'Wooden Dining Table Set', brand: 'Urban Ladder', category: 'Furniture', sku: 'FR-UL-001', mrp: 45999, price: 39999, stock: 8, gst: 18, hsn: '9403', img: 'bx-table', rating: 4.6, reviews: 42 }
  ],

  // --- Orders ---
  orders: [
    { id: 'ORD-2026-001', customer: 'Priya Sharma', items: 3, total: 135746, status: 'delivered', date: '2026-03-28', payment: 'UPI' },
    { id: 'ORD-2026-002', customer: 'Rahul Verma', items: 1, total: 124999, status: 'shipped', date: '2026-03-29', payment: 'Credit Card' },
    { id: 'ORD-2026-003', customer: 'Anita Desai', items: 5, total: 2840, status: 'processing', date: '2026-03-30', payment: 'Cash' },
    { id: 'ORD-2026-004', customer: 'Mohammed Ali', items: 2, total: 16798, status: 'confirmed', date: '2026-03-30', payment: 'Net Banking' },
    { id: 'ORD-2026-005', customer: 'Sneha Patel', items: 4, total: 52396, status: 'pending', date: '2026-03-31', payment: 'UPI' },
    { id: 'ORD-2026-006', customer: 'Vikram Singh', items: 1, total: 109900, status: 'delivered', date: '2026-03-25', payment: 'EMI' },
    { id: 'ORD-2026-007', customer: 'Deepa Nair', items: 6, total: 4230, status: 'cancelled', date: '2026-03-27', payment: 'Wallet' },
    { id: 'ORD-2026-008', customer: 'Arjun Kapoor', items: 2, total: 9536, status: 'returned', date: '2026-03-24', payment: 'Debit Card' }
  ],

  // --- Invoices ---
  invoices: [
    { id: 'INV-2026-001', order: 'ORD-2026-001', customer: 'Priya Sharma', amount: 135746, tax: 20440, date: '2026-03-28', status: 'paid', type: 'Tax Invoice' },
    { id: 'INV-2026-002', order: 'ORD-2026-002', customer: 'Rahul Verma', amount: 124999, tax: 19067, date: '2026-03-29', status: 'paid', type: 'Tax Invoice' },
    { id: 'INV-2026-003', order: 'ORD-2026-003', customer: 'Anita Desai', amount: 2840, tax: 142, date: '2026-03-30', status: 'unpaid', type: 'Tax Invoice' },
    { id: 'INV-2026-004', order: 'ORD-2026-006', customer: 'Vikram Singh', amount: 109900, tax: 16765, date: '2026-03-25', status: 'paid', type: 'Tax Invoice' },
    { id: 'CN-2026-001', order: 'ORD-2026-007', customer: 'Deepa Nair', amount: 4230, tax: 380, date: '2026-03-27', status: 'issued', type: 'Credit Note' }
  ],

  // --- Customers ---
  customers: [
    { id: 1, name: 'Priya Sharma', email: 'priya@email.com', phone: '98765 43210', type: 'B2C', orders: 12, spent: 245600, status: 'active', tier: 'Gold' },
    { id: 2, name: 'Rahul Verma', email: 'rahul@company.com', phone: '98765 43211', type: 'B2B', gstin: '29AABCU1234F1Z5', orders: 45, spent: 1250000, status: 'active', tier: 'Platinum' },
    { id: 3, name: 'Anita Desai', email: 'anita@email.com', phone: '98765 43212', type: 'B2C', orders: 3, spent: 8700, status: 'active', tier: 'Silver' },
    { id: 4, name: 'Mohammed Ali', email: 'ali@email.com', phone: '98765 43213', type: 'B2C', orders: 8, spent: 68900, status: 'active', tier: 'Gold' },
    { id: 5, name: 'Sneha Patel', email: 'sneha@email.com', phone: '98765 43214', type: 'B2C', orders: 22, spent: 189000, status: 'active', tier: 'Gold' },
    { id: 6, name: 'Vikram Singh', email: 'vikram@biz.com', phone: '98765 43215', type: 'B2B', gstin: '07AABCU5678G1Z3', orders: 67, spent: 3450000, status: 'active', tier: 'Diamond' },
    { id: 7, name: 'Deepa Nair', email: 'deepa@email.com', phone: '98765 43216', type: 'B2C', orders: 5, spent: 15600, status: 'blocked', tier: 'Silver' }
  ],

  // --- Service Providers ---
  providers: [
    { id: 1, name: 'Quick Delivery Services', contact: 'Raj Kumar', phone: '98765 43220', type: 'Delivery', orders: 234, rating: 4.5, status: 'active', commission: '8%' },
    { id: 2, name: 'Fresh Farm Produce', contact: 'Lakshmi Devi', phone: '98765 43221', type: 'Vendor', orders: 156, rating: 4.2, status: 'active', commission: '12%' },
    { id: 3, name: 'MedExpress Pharma', contact: 'Dr. Suresh', phone: '98765 43222', type: 'Vendor', orders: 89, rating: 4.8, status: 'active', commission: '10%' },
    { id: 4, name: 'City Logistics', contact: 'Arjun M', phone: '98765 43223', type: 'Delivery', orders: 567, rating: 3.9, status: 'suspended', commission: '7%' }
  ],

  // --- Notifications ---
  notifications: [
    { id: 1, title: 'New Order Received', message: 'Order #ORD-2026-005 from Sneha Patel', time: '2 minutes ago', type: 'order', read: false },
    { id: 2, title: 'Low Stock Alert', message: 'Apple MacBook Air M3 - Only 15 units left', time: '15 minutes ago', type: 'inventory', read: false },
    { id: 3, title: 'Payment Received', message: '₹1,24,999 received for Order #ORD-2026-002', time: '1 hour ago', type: 'payment', read: true },
    { id: 4, title: 'Return Request', message: 'Arjun Kapoor requested return for Order #ORD-2026-008', time: '3 hours ago', type: 'return', read: true },
    { id: 5, title: 'Service Provider Alert', message: 'City Logistics rating dropped below 4.0', time: '5 hours ago', type: 'alert', read: true },
    { id: 6, title: 'Expiry Alert', message: '25 items expiring within 30 days', time: '1 day ago', type: 'expiry', read: true }
  ],

  // --- Support Tickets ---
  tickets: [
    { id: 'TKT-001', subject: 'Wrong item delivered', customer: 'Deepa Nair', priority: 'high', status: 'open', date: '2026-03-30', category: 'Delivery' },
    { id: 'TKT-002', subject: 'Refund not received', customer: 'Arjun Kapoor', priority: 'medium', status: 'in-progress', date: '2026-03-29', category: 'Payment' },
    { id: 'TKT-003', subject: 'Product quality concern', customer: 'Priya Sharma', priority: 'low', status: 'resolved', date: '2026-03-28', category: 'Product' },
    { id: 'TKT-004', subject: 'Unable to apply coupon', customer: 'Mohammed Ali', priority: 'medium', status: 'open', date: '2026-03-30', category: 'Offers' }
  ],

  // --- Dashboard Stats ---
  dashboardStats: {
    totalSales: 2456780,
    todaySales: 148500,
    totalOrders: 1245,
    todayOrders: 38,
    totalCustomers: 890,
    newCustomers: 12,
    totalProducts: 4635,
    lowStock: 23,
    pendingOrders: 15,
    avgOrderValue: 3875,
    returnRate: 2.3,
    topCategory: 'Electronics'
  },

  // --- Locations ---
  locations: [
    { id: 1, name: 'Main Warehouse', type: 'Warehouse', city: 'Bangalore', capacity: '85%', items: 3200, status: 'active' },
    { id: 2, name: 'MG Road Store', type: 'Retail Store', city: 'Bangalore', capacity: '60%', items: 450, status: 'active' },
    { id: 3, name: 'Indiranagar Branch', type: 'Retail Store', city: 'Bangalore', capacity: '72%', items: 380, status: 'active' },
    { id: 4, name: 'Chennai Hub', type: 'Warehouse', city: 'Chennai', capacity: '45%', items: 1800, status: 'active' }
  ],

  // --- Payment Modes ---
  paymentModes: [
    { id: 1, name: 'Cash', icon: 'bx-money', status: 'active' },
    { id: 2, name: 'Credit Card', icon: 'bx-credit-card', status: 'active' },
    { id: 3, name: 'Debit Card', icon: 'bx-credit-card-alt', status: 'active' },
    { id: 4, name: 'UPI', icon: 'bx-qr', status: 'active' },
    { id: 5, name: 'Net Banking', icon: 'bx-building', status: 'active' },
    { id: 6, name: 'Wallet', icon: 'bx-wallet', status: 'active' },
    { id: 7, name: 'EMI', icon: 'bx-calendar', status: 'active' },
    { id: 8, name: 'Pay Later', icon: 'bx-time', status: 'inactive' }
  ],

  // --- Charges ---
  charges: [
    { id: 1, name: 'Standard Delivery', type: 'Delivery', amount: 49, condition: 'Orders below ₹500', status: 'active' },
    { id: 2, name: 'Express Delivery', type: 'Delivery', amount: 99, condition: 'All orders', status: 'active' },
    { id: 3, name: 'Packing Charge', type: 'Packing', amount: 20, condition: 'Gift wrapping', status: 'active' },
    { id: 4, name: 'Platform Fee', type: 'Platform', amount: 5, condition: 'Online orders', status: 'active' }
  ],

  // --- Discounts ---
  discounts: [
    { id: 1, name: 'Summer Sale 20%', type: 'Percentage', value: '20%', applies: 'All Items', validTill: '2026-04-30', status: 'active', used: 345 },
    { id: 2, name: 'First Order ₹200 Off', type: 'Flat', value: '₹200', applies: 'New Customers', validTill: '2026-12-31', status: 'active', used: 89 },
    { id: 3, name: 'Electronics 15%', type: 'Percentage', value: '15%', applies: 'Electronics', validTill: '2026-04-15', status: 'active', used: 156 },
    { id: 4, name: 'Bulk Purchase 10%', type: 'Percentage', value: '10%', applies: 'Min 5 items', validTill: '2026-06-30', status: 'active', used: 67 }
  ],

  // --- Cart items for customer view ---
  cartItems: [
    { ...null, productId: 1, qty: 1 },
    { ...null, productId: 5, qty: 3 },
    { ...null, productId: 9, qty: 5 }
  ],

  // --- Addresses ---
  addresses: [
    { id: 1, label: 'Home', name: 'Priya Sharma', phone: '98765 43210', line1: '42, 3rd Cross Road', line2: 'Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka', pin: '560034', default: true },
    { id: 2, label: 'Office', name: 'Priya Sharma', phone: '98765 43210', line1: 'WeWork Galaxy, #43', line2: 'Residency Road', city: 'Bangalore', state: 'Karnataka', pin: '560025', default: false }
  ],

  // --- Provider Earnings ---
  providerEarnings: {
    totalEarnings: 145600,
    thisMonth: 38500,
    pending: 12400,
    lastPayout: 26100,
    payoutDate: '2026-03-25'
  },

  // --- Formatters ---
  formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  getStatusBadge(status) {
    const map = {
      active: 'badge-success', inactive: 'badge-default', blocked: 'badge-danger', suspended: 'badge-danger',
      delivered: 'badge-success', shipped: 'badge-info', processing: 'badge-warning', confirmed: 'badge-primary',
      pending: 'badge-warning', cancelled: 'badge-danger', returned: 'badge-purple',
      paid: 'badge-success', unpaid: 'badge-danger', issued: 'badge-info',
      open: 'badge-warning', 'in-progress': 'badge-info', resolved: 'badge-success',
      high: 'badge-danger', medium: 'badge-warning', low: 'badge-default'
    };
    return `<span class="badge ${map[status] || 'badge-default'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
  }
};
