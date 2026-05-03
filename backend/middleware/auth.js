const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw new AppError('Not authorized, no token', 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'nexastore_access_secret_key_2024');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      throw new AppError('User not found', 401);
    }
    if (!req.user.isActive) {
      throw new AppError('Account deactivated', 401);
    }
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized`, 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
