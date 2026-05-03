const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Warehouse = require('./models/Warehouse');
const StockEntry = require('./models/StockEntry');
const Supplier = require('./models/Supplier');
const Order = require('./models/Order');
const Vehicle = require('./models/Vehicle');
const Staff = require('./models/Staff');
const VehicleAssignment = require('./models/VehicleAssignment');
const DeliveryTrip = require('./models/DeliveryTrip');
const MaintenanceLog = require('./models/MaintenanceLog');
const AttendanceLog = require('./models/AttendanceLog');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
      Warehouse.deleteMany({}), StockEntry.deleteMany({}), Supplier.deleteMany({}),
      Order.deleteMany({}),
      Vehicle.deleteMany({}), Staff.deleteMany({}), VehicleAssignment.deleteMany({}),
      DeliveryTrip.deleteMany({}), MaintenanceLog.deleteMany({}), AttendanceLog.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create Users
    const admin = await User.create({
      name: 'Admin User', email: 'admin@onakobigmart.com', password: 'Admin@123', role: 'admin',
      phone: '555-0100',
    });
    const customer = await User.create({
      name: 'John Customer', email: 'customer@onakobigmart.com', password: 'Customer@123', role: 'customer',
      phone: '555-0200',
      savedAddresses: [{ label: 'Home', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US', isDefault: true }],
    });
    console.log('Users created');

    // Create Categories
    const categories = await Category.create([
      { name: 'Electronics', type: 'category', description: 'Electronic gadgets and devices', sortOrder: 1 },
      { name: 'Clothing', type: 'category', description: 'Apparel and fashion', sortOrder: 2 },
      { name: 'Home & Kitchen', type: 'category', description: 'Home appliances and kitchenware', sortOrder: 3 },
      { name: 'Sports & Outdoors', type: 'category', description: 'Sports equipment and outdoor gear', sortOrder: 4 },
      { name: 'Books', type: 'category', description: 'Books and stationery', sortOrder: 5 },
    ]);
    const brandSamsung = await Category.create({ name: 'Samsung', type: 'brand', sortOrder: 1 });
    const brandNike = await Category.create({ name: 'Nike', type: 'brand', sortOrder: 2 });
    console.log('Categories created');

    // Create Warehouses
    const warehouses = await Warehouse.create([
      {
        name: 'Main Warehouse', code: 'WH-001', type: 'warehouse',
        address: { street: '500 Industrial Blvd', city: 'Dallas', state: 'TX', zip: '75201', country: 'US' },
        capacity: 10000, managerName: 'Bob Manager', phone: '555-0300',
      },
      {
        name: 'East Coast Hub', code: 'WH-002', type: 'warehouse',
        address: { street: '200 Distribution Ave', city: 'Newark', state: 'NJ', zip: '07102', country: 'US' },
        capacity: 5000, managerName: 'Alice Supervisor', phone: '555-0400',
      },
    ]);
    console.log('Warehouses created');

    // Create Products
    const productData = [
      { name: 'Wireless Bluetooth Headphones', sku: 'WBH-001', price: 79.99, compareAtPrice: 99.99, costPrice: 35, category: categories[0]._id, brand: brandSamsung._id, description: 'Premium wireless headphones with noise cancellation, 30-hour battery life, and crystal clear audio.', shortDescription: 'Noise-canceling wireless headphones', isFeatured: true, tags: ['headphones', 'wireless', 'bluetooth'], images: [{ url: 'https://placehold.co/600x600/3B82F6/white?text=Headphones', altText: 'Wireless Headphones', isPrimary: true }], attributes: [{ name: 'Color', value: 'Black' }, { name: 'Battery', value: '30 hours' }] },
      { name: 'Smart Watch Pro', sku: 'SWP-002', price: 199.99, compareAtPrice: 249.99, costPrice: 90, category: categories[0]._id, brand: brandSamsung._id, description: 'Advanced smartwatch with health monitoring, GPS, and water resistance.', shortDescription: 'Health monitoring smartwatch', isFeatured: true, tags: ['smartwatch', 'fitness', 'health'], images: [{ url: 'https://placehold.co/600x600/10B981/white?text=SmartWatch', altText: 'Smart Watch', isPrimary: true }], attributes: [{ name: 'Size', value: '44mm' }] },
      { name: 'Running Shoes Ultra', sku: 'RSU-003', price: 129.99, compareAtPrice: 159.99, costPrice: 55, category: categories[3]._id, brand: brandNike._id, description: 'Lightweight running shoes with responsive cushioning for maximum comfort.', shortDescription: 'Lightweight running shoes', isFeatured: true, tags: ['shoes', 'running', 'sports'], images: [{ url: 'https://placehold.co/600x600/F59E0B/white?text=RunningShoes', altText: 'Running Shoes', isPrimary: true }], attributes: [{ name: 'Size', value: '10' }, { name: 'Color', value: 'Blue' }] },
      { name: 'Premium Cotton T-Shirt', sku: 'PCT-004', price: 29.99, costPrice: 10, category: categories[1]._id, description: 'Soft premium cotton crew neck t-shirt in multiple colors.', shortDescription: 'Premium cotton tee', tags: ['tshirt', 'cotton', 'casual'], images: [{ url: 'https://placehold.co/600x600/8B5CF6/white?text=T-Shirt', altText: 'Cotton T-Shirt', isPrimary: true }], attributes: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'White' }] },
      { name: 'Stainless Steel Blender', sku: 'SSB-005', price: 89.99, compareAtPrice: 119.99, costPrice: 40, category: categories[2]._id, description: 'Powerful 1000W blender with 6 blades and 3 speed settings.', shortDescription: '1000W power blender', isFeatured: true, tags: ['blender', 'kitchen', 'appliance'], images: [{ url: 'https://placehold.co/600x600/EF4444/white?text=Blender', altText: 'Blender', isPrimary: true }] },
      { name: 'Yoga Mat Professional', sku: 'YMP-006', price: 45.99, costPrice: 15, category: categories[3]._id, description: 'Non-slip professional yoga mat with alignment guides.', shortDescription: 'Pro yoga mat', tags: ['yoga', 'fitness', 'mat'], images: [{ url: 'https://placehold.co/600x600/06B6D4/white?text=YogaMat', altText: 'Yoga Mat', isPrimary: true }] },
      { name: 'The Art of Programming', sku: 'TAP-007', price: 39.99, costPrice: 12, category: categories[4]._id, description: 'Comprehensive guide to modern software development practices.', shortDescription: 'Programming guide book', tags: ['book', 'programming', 'tech'], images: [{ url: 'https://placehold.co/600x600/0F172A/white?text=Book', altText: 'Programming Book', isPrimary: true }] },
      { name: 'Wireless Charger Pad', sku: 'WCP-008', price: 34.99, compareAtPrice: 49.99, costPrice: 12, category: categories[0]._id, description: 'Fast wireless charging pad compatible with all Qi-enabled devices.', shortDescription: 'Qi wireless charger', isFeatured: true, tags: ['charger', 'wireless', 'accessories'], images: [{ url: 'https://placehold.co/600x600/6366F1/white?text=Charger', altText: 'Wireless Charger', isPrimary: true }] },
      { name: 'Ceramic Coffee Mug Set', sku: 'CCM-009', price: 24.99, costPrice: 8, category: categories[2]._id, description: 'Set of 4 handcrafted ceramic coffee mugs in assorted colors.', shortDescription: '4-piece mug set', tags: ['mug', 'kitchen', 'ceramic'], images: [{ url: 'https://placehold.co/600x600/D946EF/white?text=MugSet', altText: 'Coffee Mug Set', isPrimary: true }] },
      { name: 'Denim Jacket Classic', sku: 'DJC-010', price: 79.99, compareAtPrice: 99.99, costPrice: 30, category: categories[1]._id, description: 'Classic fit denim jacket with vintage wash.', shortDescription: 'Classic denim jacket', tags: ['jacket', 'denim', 'fashion'], images: [{ url: 'https://placehold.co/600x600/1E40AF/white?text=DenimJacket', altText: 'Denim Jacket', isPrimary: true }] },
    ];

    const products = [];
    for (const p of productData) {
      p.createdBy = admin._id;
      const product = await Product.create(p);
      products.push(product);
    }
    console.log('Products created');

    // Create Stock Entries
    for (const product of products) {
      await StockEntry.create({
        product: product._id,
        warehouse: warehouses[0]._id,
        quantity: Math.floor(Math.random() * 100) + 20,
        unit: 'pcs',
      });
    }
    console.log('Stock entries created');

    // Create Suppliers
    const suppliers = await Supplier.create([
      {
        name: 'TechSupply Co', code: 'SUP-001', contactPerson: 'Mike Johnson',
        email: 'mike@techsupply.com', phone: '555-0500',
        address: { street: '100 Tech Row', city: 'San Jose', state: 'CA', zip: '95112' },
        paymentTerms: 'Net 30', rating: 4,
      },
      {
        name: 'Global Textiles Ltd', code: 'SUP-002', contactPerson: 'Sarah Williams',
        email: 'sarah@globaltextiles.com', phone: '555-0600',
        address: { street: '200 Fabric Lane', city: 'Los Angeles', state: 'CA', zip: '90015' },
        paymentTerms: 'Net 45', rating: 5,
      },
    ]);
    console.log('Suppliers created');

    // Create Sample Orders
    const ordersData = [
      {
        customer: customer._id,
        items: [
          { product: products[0]._id, sku: products[0].sku, name: products[0].name, quantity: 1, unitPrice: products[0].price, discount: 0, subtotal: products[0].price },
          { product: products[7]._id, sku: products[7].sku, name: products[7].name, quantity: 2, unitPrice: products[7].price, discount: 0, subtotal: products[7].price * 2 },
        ],
        shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US', phone: '555-0200' },
        pricing: { subtotal: 149.97, tax: 12.00, shippingCost: 5.99, discount: 0, total: 167.96 },
        paymentMethod: 'card', paymentStatus: 'paid', orderStatus: 'delivered',
        statusHistory: [
          { status: 'pending', note: 'Order placed', updatedBy: customer._id },
          { status: 'confirmed', note: 'Payment confirmed', updatedBy: admin._id },
          { status: 'delivered', note: 'Delivered to customer', updatedBy: admin._id },
        ],
      },
      {
        customer: customer._id,
        items: [
          { product: products[2]._id, sku: products[2].sku, name: products[2].name, quantity: 1, unitPrice: products[2].price, discount: 0, subtotal: products[2].price },
        ],
        shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US', phone: '555-0200' },
        pricing: { subtotal: 129.99, tax: 10.40, shippingCost: 5.99, discount: 0, total: 146.38 },
        paymentMethod: 'cod', paymentStatus: 'pending', orderStatus: 'processing',
        statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: customer._id }],
      },
      {
        customer: customer._id,
        items: [
          { product: products[4]._id, sku: products[4].sku, name: products[4].name, quantity: 1, unitPrice: products[4].price, discount: 10, subtotal: 79.99 },
        ],
        shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US', phone: '555-0200' },
        pricing: { subtotal: 79.99, tax: 6.40, shippingCost: 0, discount: 10, total: 76.39 },
        paymentMethod: 'card', paymentStatus: 'paid', orderStatus: 'shipped',
        statusHistory: [
          { status: 'pending', note: 'Order placed', updatedBy: customer._id },
          { status: 'shipped', note: 'Package shipped', updatedBy: admin._id },
        ],
      },
    ];

    for (const orderData of ordersData) {
      await Order.create(orderData);
    }
    const createdOrders = await Order.find();
    console.log('Orders created');

    // Create Vehicles
    const vehicles = await Vehicle.create([
      { registrationNumber: 'NY-DEL-101', make: 'Ford', model: 'Transit', type: 'van', status: 'available' },
      { registrationNumber: 'NY-DEL-102', make: 'Mercedes', model: 'Sprinter', type: 'van', status: 'assigned' },
      { registrationNumber: 'NY-DEL-103', make: 'Isuzu', model: 'NPR', type: 'truck', status: 'available' },
      { registrationNumber: 'NY-DEL-104', make: 'Honda', model: 'Super Cub', type: 'bike', status: 'available' },
    ]);
    console.log('Vehicles created');

    // Create Staff
    const staff = await Staff.create([
      { name: 'Mike Driver', employeeId: 'STF-001', role: 'driver', phone: '555-0700', email: 'mike@onakobigmart.com' },
      { name: 'Sarah Driver', employeeId: 'STF-002', role: 'driver', phone: '555-0800', email: 'sarah@onakobigmart.com' },
      { name: 'Dave Loader', employeeId: 'STF-003', role: 'loader', phone: '555-0900', email: 'dave@onakobigmart.com' },
    ]);
    console.log('Staff created');

    // Create Vehicle Assignments
    const assignment = await VehicleAssignment.create({
      vehicle: vehicles[1]._id,
      staff: staff[0]._id,
      date: new Date(),
      status: 'active',
      createdBy: admin._id,
    });
    console.log('Assignments created');

    // Create Delivery Trips
    const trip = await DeliveryTrip.create({
      vehicle: vehicles[1]._id,
      driver: staff[0]._id,
      orders: [createdOrders[0]._id, createdOrders[1]._id],
      status: 'in_progress',
      plannedDate: new Date(),
      actualStartTime: '09:00',
      createdBy: admin._id,
    });
    console.log('Trips created');

    // Create Maintenance Logs
    await MaintenanceLog.create([
      { vehicle: vehicles[0]._id, type: 'service', description: 'Regular oil change', cost: 150, status: 'completed', maintenanceDate: new Date(), loggedBy: admin._id },
      { vehicle: vehicles[2]._id, type: 'repair', description: 'Brake pad replacement', cost: 300, status: 'scheduled', maintenanceDate: new Date(), loggedBy: admin._id },
    ]);
    console.log('Maintenance logs created');

    // Create Attendance Logs
    await AttendanceLog.create([
      { staff: staff[0]._id, date: new Date(), clockIn: '08:00', status: 'present', recordedBy: admin._id },
      { staff: staff[1]._id, date: new Date(), clockIn: '08:15', status: 'present', recordedBy: admin._id },
      { staff: staff[2]._id, date: new Date(), status: 'absent', recordedBy: admin._id },
    ]);
    console.log('Attendance logs created');

    console.log('\n✅ Seed completed successfully!');
    console.log('Admin login: admin@onakobigmart.com / Admin@123');
    console.log('Customer login: customer@onakobigmart.com / Customer@123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
