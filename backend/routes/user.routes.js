const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', protect, authorize('admin'), c.getAll);
router.get('/:id', protect, authorize('admin'), c.getOne);
router.post('/', protect, authorize('admin'), c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.patch('/:id/status', protect, authorize('admin'), c.toggleStatus);
router.patch('/:id/reset-password', protect, authorize('admin'), c.resetPassword);

module.exports = router;
