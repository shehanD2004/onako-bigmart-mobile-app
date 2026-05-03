const router = require('express').Router();
const c = require('../controllers/stockMovementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getAll);
router.get('/:id', protect, c.getOne);
router.post('/', protect, authorize('admin', 'warehouse_mgr'), c.create);
router.put('/:id', protect, authorize('admin', 'warehouse_mgr'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
