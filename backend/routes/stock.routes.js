const router = require('express').Router();
const c = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getAll);
router.get('/product/:productId', protect, c.getByProduct);
router.get('/warehouse/:warehouseId', protect, c.getByWarehouse);
router.post('/', protect, authorize('admin', 'warehouse_mgr'), c.create);
router.put('/:id', protect, authorize('admin', 'warehouse_mgr'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
