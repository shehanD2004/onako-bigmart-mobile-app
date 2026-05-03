const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/verify-email/:token', c.verifyEmail);
router.post('/logout', protect, c.logout);
router.post('/refresh', c.refresh);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, c.updateProfile);
router.put('/password', protect, c.updatePassword);
router.get('/addresses', protect, c.getAddresses);
router.post('/addresses', protect, c.addAddress);
router.delete('/addresses/:addressId', protect, c.deleteAddress);
router.put('/addresses/:addressId/default', protect, c.setDefaultAddress);

module.exports = router;
