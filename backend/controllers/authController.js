const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { AppError } = require('../middleware/errorHandler');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 400);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role || 'customer',
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    const verifyUrl = `http://192.168.239.245:5000/api/auth/verify-email/${verificationToken}`;

    const message = `
      <h1>Verify Your Email</h1>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your Onako Bigmart account',
        html: message,
      });
      res.status(201).json({ 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account.',
        verifyUrl,
        requiresVerification: true
      });
    } catch (error) {
      // Allow registration to proceed in development even if Email fails to send due to missing credentials.
      console.error("Nodemailer failed (Ignore this if you haven't set up SMTP credentials yet):", error.message);
      res.status(201).json({ 
        success: true, 
        message: 'Registration successful! Please verify your email.',
        verifyUrl,
        requiresVerification: true
      });
    }
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError('Invalid credentials', 401);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account deactivated', 401);
    if (!user.isVerified) throw new AppError('Please check your email and verify your account before logging in', 403);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, accessToken, refreshToken, user });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find user with token and ensure token is not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) throw new AppError('Invalid or expired verification token', 400);

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1 style="color: green;">Email Verified Successfully!</h1>
          <p>Your email has been verified. You can now return to the app and login.</p>
        </body>
      </html>
    `);
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid refresh token', 401);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PUT /api/auth/password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

// Address management
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.savedAddresses });
  } catch (err) { next(err); }
};

exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const isFirst = user.savedAddresses.length === 0;
    const newAddress = { ...req.body, isDefault: isFirst || req.body.isDefault };
    
    // If setting default, unset other defaults
    if (newAddress.isDefault && !isFirst) {
      user.savedAddresses.forEach(a => { a.isDefault = false; });
    }
    
    user.savedAddresses.push(newAddress);
    await user.save({ validateBeforeSave: false });
    res.status(201).json({ success: true, data: user.savedAddresses });
  } catch (err) { next(err); }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Prevent deleting the very last address if we wanted strict guard in backend, 
    // but the UI will handle the disabled button. We just do the delete.
    const addressToDelete = user.savedAddresses.id(req.params.addressId);
    if (!addressToDelete) throw new AppError('Address not found', 404);
    
    const wasDefault = addressToDelete.isDefault;
    user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== req.params.addressId);
    
    // If we deleted the default and there are still addresses left, make the first one default
    if (wasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: user.savedAddresses });
  } catch (err) { next(err); }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addressId = req.params.addressId;
    
    const addressExists = user.savedAddresses.id(addressId);
    if (!addressExists) throw new AppError('Address not found', 404);

    user.savedAddresses.forEach(a => {
      a.isDefault = a._id.toString() === addressId;
    });

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: user.savedAddresses });
  } catch (err) { next(err); }
};
