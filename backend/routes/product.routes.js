const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', c.getAll);
router.get('/:id', c.getOne);
router.get('/sku/:sku', c.getBySku);
router.post('/', protect, authorize('admin', 'warehouse_mgr'), c.create);
router.put('/:id', protect, authorize('admin', 'warehouse_mgr'), c.update);
router.patch('/:id/status', protect, authorize('admin', 'warehouse_mgr'), c.toggleStatus);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
