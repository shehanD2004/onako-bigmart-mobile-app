const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'staff', 'warehouse_mgr'), c.getAll);
router.get('/track/:orderNumber', c.trackOrder);
router.get('/my', protect, c.getMy);
router.get('/:id', protect, c.getOne);
router.post('/', protect, c.create);
router.put('/:id/status', protect, authorize('admin', 'staff', 'warehouse_mgr'), c.updateStatus);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, c.remove);

module.exports = router;
