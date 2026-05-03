const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI) require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB and then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Onako Bigmart API running on port ${PORT}`);
  });
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from client build (if available)
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/warehouses', require('./routes/warehouse.routes'));
app.use('/api/stock', require('./routes/stock.routes'));
app.use('/api/stock-movements', require('./routes/stockMovement.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/returns', require('./routes/return.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrder.routes'));
app.use('/api/supplier-products', require('./routes/supplierProduct.routes'));
app.use('/api/supplier-deliveries', require('./routes/supplierDelivery.routes'));
app.use('/api/supplier-invoices', require('./routes/supplierInvoice.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/vehicle-assignments', require('./routes/vehicleAssignment.routes'));
app.use('/api/delivery-trips', require('./routes/deliveryTrip.routes'));
app.use('/api/maintenance-logs', require('./routes/maintenanceLog.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/store', require('./routes/store.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Onako Bigmart API is running', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Onako Bigmart API is running', timestamp: new Date() });
});

// SPA fallback - serve index.html for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    }
  });
});

// 404 handler (fallback)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
