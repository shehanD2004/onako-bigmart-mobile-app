const router = require('express').Router();
const c = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getAll);
router.get('/:id', protect, c.getOne);
router.post('/', protect, authorize('admin'), c.create);
router.post('/auto-generate', protect, authorize('admin'), c.autoGenerate);
router.put('/:id', protect, authorize('admin'), c.update);
router.put('/:id/status', protect, authorize('admin'), c.updateStatus);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
