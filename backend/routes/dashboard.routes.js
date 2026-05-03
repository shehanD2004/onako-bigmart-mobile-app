const router = require('express').Router();
const { getDashboardStats } = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
