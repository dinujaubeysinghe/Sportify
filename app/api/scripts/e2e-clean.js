/*
  Cleanup script for advanced E2E checks.
  Removes test data created by e2e-check: products named "Pro Ball ...",
  categories named "Balls ...", brands named "SportifyBrand ...",
  carts and recent orders from dev.customer@sportify.com, and inventories for those products.
*/

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Inventory = require('../models/Inventory');

async function main() {
  const result = { deleted: {} };
  try {
    await connectDB();

    const nameFilters = {
      product: { name: { $regex: /^Pro Ball / } },
      category: { name: { $regex: /^Balls / } },
      brand: { name: { $regex: /^SportifyBrand / } },
    };

    const devCustomer = await User.findOne({ email: 'dev.customer@sportify.com' });

    // Delete orders for dev customer in last 2 days
    if (devCustomer) {
      const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const orders = await Order.find({ user: devCustomer._id, createdAt: { $gte: since } }, '_id');
      const orderIds = orders.map(o => o._id);
      if (orderIds.length) {
        await Order.deleteMany({ _id: { $in: orderIds } });
        result.deleted.orders = orderIds.length;
      } else {
        result.deleted.orders = 0;
      }

      // Clear cart
      await Cart.deleteOne({ user: devCustomer._id });
      result.deleted.carts = 1;
    }

    // Find products to delete first to cascade inventory
    const products = await Product.find(nameFilters.product, '_id');
    const productIds = products.map(p => p._id);
    if (productIds.length) {
      await Inventory.deleteMany({ product: { $in: productIds } });
      await Product.deleteMany({ _id: { $in: productIds } });
      result.deleted.products = productIds.length;
      result.deleted.inventories = true;
    } else {
      result.deleted.products = 0;
      result.deleted.inventories = 0;
    }

    // Categories & Brands
    const catRes = await Category.deleteMany(nameFilters.category);
    result.deleted.categories = catRes.deletedCount || 0;
    const brandRes = await Brand.deleteMany(nameFilters.brand);
    result.deleted.brands = brandRes.deletedCount || 0;

    console.log(JSON.stringify({ success: true, result }));
  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message }));
    process.exitCode = 1;
  } finally {
    try { await mongoose.connection.close(); } catch (e) {}
  }
}

main();


