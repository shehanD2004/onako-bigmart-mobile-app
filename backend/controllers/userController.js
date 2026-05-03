const User = require('../models/User');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    
    // Validate and apply role filter
    const validRoles = ['customer', 'staff', 'supplier', 'warehouse_mgr', 'admin'];
    if (req.query.role && validRoles.includes(req.query.role)) {
      filter.role = req.query.role;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    const result = await paginate(User, filter, req);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { 
    if (err.code === 11000) {
      return next(new AppError('Email already exists', 400));
    }
    next(err); 
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Don't allow password updates via this route

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new AppError('User not found', 404);

    // Last-admin demotion guard
    if (targetUser.role === 'admin' && updates.role && updates.role !== 'admin') {
      const activeAdminsCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminsCount <= 1) {
        throw new AppError('Cannot demote the last active admin', 400);
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) { 
    if (err.code === 11000) {
      return next(new AppError('Email already exists', 400));
    }
    next(err); 
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      throw new AppError('You cannot deactivate your own account', 400);
    }
    
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new AppError('User not found', 404);

    const targetStatus = typeof req.body.isActive === 'boolean' ? req.body.isActive : !targetUser.isActive;

    // Last-admin deactivation guard
    if (targetUser.role === 'admin' && !targetStatus) {
      const activeAdminsCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminsCount <= 1) {
        throw new AppError('Cannot deactivate the last active admin', 400);
      }
    }

    targetUser.isActive = targetStatus;
    await targetUser.save({ validateModifiedOnly: true }); // User schema has no conflict, or we can use findByIdAndUpdate to bypass validation
    
    res.json({ success: true, data: targetUser, message: `User ${targetStatus ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};

const bcrypt = require('bcryptjs');

exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { password: hashedPassword }, 
      { new: true, runValidators: false }
    );
    
    if (!user) throw new AppError('User not found', 404);
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};
