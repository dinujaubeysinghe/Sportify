const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sportify');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleCategories = [
  { name: 'Football', description: 'Football equipment and accessories' },
  { name: 'Basketball', description: 'Basketball gear and equipment' },
  { name: 'Tennis', description: 'Tennis rackets and accessories' },
  { name: 'Running', description: 'Running shoes and apparel' },
  { name: 'Gym', description: 'Gym equipment and accessories' }
];

const sampleBrands = [
  { name: 'Nike', description: 'Just Do It' },
  { name: 'Adidas', description: 'Impossible is Nothing' },
  { name: 'Puma', description: 'Forever Faster' },
  { name: 'Under Armour', description: 'I Will' },
  { name: 'Reebok', description: 'Be More Human' },
  { name: 'Wilson', description: 'The Official Tennis Brand' },
  { name: 'Spalding', description: 'The Official Basketball' }
];

const sampleProducts = [
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max technology',
    price: 150.00,
    categoryName: 'Running',
    brandName: 'Nike',
    sku: 'NIKE-AM270-001',
    images: [{ url: 'nike-air-max-270.jpg', alt: 'Nike Air Max 270', isPrimary: true }],
    stock: 25,
    isActive: true
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with Boost technology',
    price: 180.00,
    categoryName: 'Running',
    brandName: 'Adidas',
    sku: 'ADIDAS-UB22-001',
    images: [{ url: 'adidas-ultraboost-22.jpg', alt: 'Adidas Ultraboost 22', isPrimary: true }],
    stock: 15,
    isActive: true
  },
  {
    name: 'Wilson Pro Staff Tennis Racket',
    description: 'Professional tennis racket for advanced players',
    price: 220.00,
    categoryName: 'Tennis',
    brandName: 'Wilson',
    sku: 'WILSON-PS-001',
    images: [{ url: 'wilson-pro-staff.jpg', alt: 'Wilson Pro Staff', isPrimary: true }],
    stock: 8,
    isActive: true
  },
  {
    name: 'Spalding NBA Basketball',
    description: 'Official size basketball for indoor/outdoor play',
    price: 45.00,
    categoryName: 'Basketball',
    brandName: 'Spalding',
    sku: 'SPALDING-NBA-001',
    images: [{ url: 'spalding-nba-basketball.jpg', alt: 'Spalding NBA Basketball', isPrimary: true }],
    stock: 50,
    isActive: true
  },
  {
    name: 'Nike Dri-FIT Training Shorts',
    description: 'Moisture-wicking training shorts',
    price: 35.00,
    categoryName: 'Gym',
    brandName: 'Nike',
    sku: 'NIKE-DF-SHORTS-001',
    images: [{ url: 'nike-dri-fit-shorts.jpg', alt: 'Nike Dri-FIT Shorts', isPrimary: true }],
    stock: 30,
    isActive: true
  },
  {
    name: 'Adidas Predator Football Boots',
    description: 'Professional football boots with grip technology',
    price: 200.00,
    categoryName: 'Football',
    brandName: 'Adidas',
    sku: 'ADIDAS-PRED-001',
    images: [{ url: 'adidas-predator-boots.jpg', alt: 'Adidas Predator Boots', isPrimary: true }],
    stock: 12,
    isActive: true
  }
];

const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567891',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567892',
    address: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567893',
    address: {
      street: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    }
  },
  {
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567894',
    address: {
      street: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    }
  },
  {
    firstName: 'Sports',
    lastName: 'Supply Co',
    email: 'supplier@sportify.com',
    password: 'supplier123',
    role: 'supplier',
    phone: '+1234567895',
    businessName: 'Sports Supply Company',
    address: {
      street: '1000 Sports Ave',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    }
  }
];

const sampleOrders = [
  {
    user: null, // Will be set to actual user ID
    items: [
      {
        product: null, // Will be set to actual product ID
        quantity: 2,
        price: 150.00
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'pending',
    shipmentStatus: 'pending',
    totalAmount: 300.00,
    shippingCost: 10.00,
    taxAmount: 24.00,
    notes: 'Please handle with care'
  },
  {
    user: null,
    items: [
      {
        product: null,
        quantity: 1,
        price: 180.00
      }
    ],
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    billingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    shipmentStatus: 'shipped',
    totalAmount: 190.00,
    shippingCost: 10.00,
    taxAmount: 0.00,
    trackingNumber: 'TRK123456789',
    shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    user: null,
    items: [
      {
        product: null,
        quantity: 1,
        price: 220.00
      }
    ],
    shippingAddress: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    billingAddress: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'completed',
    shipmentStatus: 'delivered',
    totalAmount: 230.00,
    shippingCost: 10.00,
    taxAmount: 0.00,
    trackingNumber: 'TRK987654321',
    shippedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
];

const sampleNotifications = [
  {
    user: null, // Will be set to admin/staff user
    title: 'Low Stock Alert',
    message: 'Nike Air Max 270 is running low on stock (5 items remaining)',
    type: 'warning',
    read: false,
    link: '/admin/products'
  },
  {
    user: null,
    title: 'New Order Received',
    message: 'New order #ORD001 from John Smith for $300.00',
    type: 'info',
    read: false,
    link: '/admin/orders'
  },
  {
    user: null,
    title: 'Customer Support Request',
    message: 'Sarah Johnson has submitted a support ticket regarding order delivery',
    type: 'support',
    read: false,
    link: '/admin/support'
  },
  {
    user: null,
    title: 'Payment Failed',
    message: 'Payment failed for order #ORD002 from Mike Wilson',
    type: 'error',
    read: false,
    link: '/admin/orders'
  }
];

// Main function to populate database
const populateDatabase = async () => {
  try {
    console.log('🚀 Starting database population...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create brands
    console.log('🏷️ Creating brands...');
    const createdBrands = await Brand.insertMany(sampleBrands);
    console.log(`✅ Created ${createdBrands.length} brands`);

    // Create users
    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create products with proper category and brand references
    console.log('🛍️ Creating products...');
    console.log('Available categories:', createdCategories.map(c => c.name));
    console.log('Available brands:', createdBrands.map(b => b.name));
    
    // Find supplier user
    const supplier = createdUsers.find(user => user.role === 'supplier');
    if (!supplier) {
      throw new Error('Supplier user not found');
    }

    const productsWithReferences = sampleProducts.map(product => {
      const category = createdCategories.find(cat => cat.name === product.categoryName);
      const brand = createdBrands.find(b => b.name === product.brandName);
      
      if (!category) {
        console.error(`Category not found: ${product.categoryName}`);
        return null;
      }
      if (!brand) {
        console.error(`Brand not found: ${product.brandName}`);
        return null;
      }
      
      return {
        name: product.name,
        description: product.description,
        price: product.price,
        category: category._id,
        brand: brand._id,
        sku: product.sku,
        images: product.images,
        stock: product.stock,
        supplier: supplier._id,
        isActive: product.isActive
      };
    }).filter(Boolean);
    
    const createdProducts = await Product.insertMany(productsWithReferences);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create orders with proper user and product references
    console.log('📦 Creating orders...');
    const ordersWithReferences = sampleOrders.map((order, index) => {
      const user = createdUsers[index % createdUsers.length];
      const product = createdProducts[index % createdProducts.length];
      const supplier = createdUsers.find(u => u.role === 'supplier');
      
      return {
        user: user._id,
        items: [{
          product: product._id,
          name: product.name,
          price: order.items[0].price,
          quantity: order.items[0].quantity,
          supplier: supplier._id
        }],
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        shipmentStatus: order.shipmentStatus,
        subtotal: order.items[0].price * order.items[0].quantity,
        tax: order.taxAmount || 0,
        shippingCost: order.shippingCost || 0,
        total: order.totalAmount,
        notes: order.notes,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt
      };
    });
    // Create orders one by one to avoid orderNumber conflicts
    const createdOrders = [];
    for (let i = 0; i < ordersWithReferences.length; i++) {
      const order = new Order(ordersWithReferences[i]);
      await order.save();
      createdOrders.push(order);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    console.log(`✅ Created ${createdOrders.length} orders`);

    // Create admin and staff users for notifications
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('👑 Creating admin user...');
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@sportify.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        phone: '+1234567899',
        isVerified: true
      });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      // Update existing admin user to be verified
      adminUser.isVerified = true;
      await adminUser.save();
      console.log('✅ Admin user verified');
    }

    // Create staff user
    const staffUser = await User.findOne({ role: 'staff' });
    if (!staffUser) {
      console.log('👨‍💼 Creating staff user...');
      const staff = new User({
        firstName: 'Staff',
        lastName: 'Member',
        email: 'staff@sportify.com',
        password: await bcrypt.hash('staff123', 12),
        role: 'staff',
        phone: '+1234567898',
        employeeId: 'EMP001',
        department: 'Operations',
        hireDate: new Date(),
        isVerified: true
      });
      await staff.save();
      console.log('✅ Staff user created');
    } else {
      // Update existing staff user to be verified
      staffUser.isVerified = true;
      await staffUser.save();
      console.log('✅ Staff user verified');
    }

    // Verify all customer users
    console.log('✅ Verifying customer users...');
    await User.updateMany({ role: 'customer' }, { isVerified: true });
    console.log('✅ All customer users verified');

    // Create notifications
    console.log('🔔 Creating notifications...');
    const admin = await User.findOne({ role: 'admin' });
    const notificationsWithUser = sampleNotifications.map(notification => ({
      ...notification,
      user: admin._id
    }));
    const createdNotifications = await Notification.insertMany(notificationsWithUser);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    // Summary
    console.log('\n🎉 Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Brands: ${createdBrands.length}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Notifications: ${createdNotifications.length}`);
    
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@sportify.com / admin123');
    console.log('   Staff: staff@sportify.com / staff123');
    console.log('   Customer: john.smith@email.com / password123');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
connectDB().then(() => {
  populateDatabase();
});
