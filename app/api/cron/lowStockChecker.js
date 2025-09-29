const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');
const { lowStockTemplate } = require('../emails/emailTemplates');

cron.schedule('0 8 * * *', async () => {
  console.log('Running Low Stock Check...');

  try {
    const lowStockInventories = await Inventory.find({
      $expr: { $lte: ['$currentStock', '$reorderPoint'] }
    }).populate('product');

    for (const inventory of lowStockInventories) {
      const product = inventory.product;
      const supplier = product.supplier;

      if (!supplier || !supplier.email) continue;

      const emailHTML = lowStockTemplate(product, inventory);

      // Send Email
      await sendEmail({
        to: supplier.email,
        subject: `Low Stock Alert: ${product.name}`,
        html: emailHTML
      });

      // Save in-app notification
      await Notification.create({
        user: supplier._id,
        title: `Low Stock Alert: ${product.name}`,
        message: `Your product "${product.name}" is low in stock. Current stock: ${inventory.currentStock}, Reorder point: ${inventory.reorderPoint}`,
        link: `/products/${product._id}`
      });

      console.log(`Notification sent to supplier: ${supplier.email} for product: ${product.name}`);
    }
  } catch (err) {
    console.error('Error sending low stock notifications:', err);
  }
}, {
  timezone: 'Asia/Colombo'
});
