/*
  Automated advanced E2E checks for Sportify API
  Flows:
  - Seed users already done via /api/test/seed-users
  - Admin: create category, brand
  - Supplier: create product (multipart form without files)
  - Customer: add to cart, set shipping, create order
  - Admin: update order status to shipped, delivered
  - Supplier: list my orders, update shipment for first item
*/

const axios = require('axios');

const API = 'http://localhost:5000/api';

async function main() {
  const results = [];
  try {
    // 1) Get seeded users & tokens
    const seed = await axios.post(`${API}/test/seed-users`).then(r => r.data.users);
    const adminToken = seed.admin.token;
    const supplierToken = seed.supplier.token;
    const customerToken = seed.customer.token;

    // Helper axios clients
    const asAdmin = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${adminToken}` } });
    const asSupplier = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${supplierToken}` } });
    const asCustomer = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${customerToken}` } });

    // 2) Admin: create category & brand
    const categoryRes = await asAdmin.post('/categories', { name: `Balls ${Date.now()}`, description: 'Sports balls' }).then(r => r.data.category);
    results.push({ step: 'createCategory', ok: true, id: categoryRes._id });

    const brandRes = await asAdmin.post('/brands', { name: `SportifyBrand ${Date.now()}` }).then(r => r.data.brand);
    results.push({ step: 'createBrand', ok: true, id: brandRes._id });

    // 3) Supplier: create product (multipart without files using fetch-compatible FormData via axios adapter)
    // Build multipart form manually using form-data if available; fallback to URLSearchParams
    let createdProduct;
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('name', `Pro Ball ${Date.now()}`);
      form.append('description', 'High quality training ball');
      form.append('price', '29.99');
      form.append('category', categoryRes._id);
      form.append('brand', brandRes._id);
      form.append('stock', '25');
      form.append('sku', `PB-${Math.floor(Math.random()*100000)}`);
      const prod = await axios.post(`${API}/products`, form, {
        headers: { Authorization: `Bearer ${supplierToken}`, ...form.getHeaders() }
      }).then(r => r.data.product);
      createdProduct = prod;
    } catch (e) {
      // Fallback: try JSON (multer route should still parse, but if it fails, we report)
      const prod = await asSupplier.post('/products', {
        name: `Pro Ball ${Date.now()}`,
        description: 'High quality training ball',
        price: 29.99,
        category: categoryRes._id,
        brand: brandRes._id,
        stock: 25,
        sku: `PB-${Math.floor(Math.random()*100000)}`
      }).then(r => r.data.product);
      createdProduct = prod;
    }
    results.push({ step: 'createProduct', ok: true, id: createdProduct._id });

    // 4) Customer: add to cart, set shipping, get summary
    await asCustomer.post('/cart/items', { productId: createdProduct._id, quantity: 2 });
    results.push({ step: 'cartAdd', ok: true });
    await asCustomer.put('/cart/shipping', {
      street: '123 Main St', city: 'NYC', state: 'NY', zipCode: '10001', country: 'USA'
    });
    const summary = await asCustomer.get('/cart/summary').then(r => r.data);
    results.push({ step: 'cartSummary', ok: true, total: summary.total });

    // 5) Customer: create order
    const orderRes = await asCustomer.post('/orders', {
      paymentMethod: 'stripe',
      shippingAddress: { firstName: 'Dev', lastName: 'Customer', street: '123 Main St', city: 'NYC', state: 'NY', zipCode: '10001', country: 'USA', phone: '1234567890' }
    }).then(r => r.data.order);
    results.push({ step: 'createOrder', ok: true, id: orderRes._id, total: orderRes.total });

    // 6) Admin: update order status shipped -> delivered
    await asAdmin.put(`/orders/${orderRes._id}/status`, { status: 'shipped', trackingNumber: 'TRACK123' });
    await asAdmin.put(`/orders/${orderRes._id}/status`, { status: 'delivered' });
    results.push({ step: 'orderStatus', ok: true });

    // 7) Supplier: list my orders and update first item shipment
    const suppOrders = await asSupplier.get('/orders/supplier/my').then(r => r.data.orders);
    if (suppOrders.length > 0 && suppOrders[0].items.length > 0) {
      const item = suppOrders[0].items[0];
      await asSupplier.put(`/orders/${suppOrders[0]._id}/items/${item._id}/shipment`, { shipmentStatus: 'shipped', trackingNumber: 'SUPP-TRACK-1' });
      results.push({ step: 'supplierShipment', ok: true });
    } else {
      results.push({ step: 'supplierShipment', ok: false, reason: 'No supplier items found' });
    }

    // 8) Admin dashboard & stats
    const dashboard = await asAdmin.get('/admin/dashboard').then(r => r.data.dashboard);
    const stats = await asAdmin.get('/orders/admin/stats').then(r => r.data.stats);
    results.push({ step: 'adminDashboard', ok: true, users: dashboard.userStats?.length || 0 });
    results.push({ step: 'orderStats', ok: true, totalOrders: stats?.totalOrders ?? 0 });

    console.log(JSON.stringify({ success: true, results }, null, 2));
  } catch (error) {
    const detail = error.response ? { status: error.response.status, data: error.response.data } : { message: error.message };
    results.push({ step: 'error', ok: false, detail });
    console.log(JSON.stringify({ success: false, results }, null, 2));
    process.exitCode = 1;
  }
}

main();


