const router = require('express').Router();
const c = require('../controllers/supplierProductController');
const { protect, authorize } = require('../middleware/auth');

router.get('/supplier/:supplierId', protect, c.getBySupplier);
router.get('/product/:productId', protect, c.getByProduct);
router.get('/best/:productId', protect, c.getBestSupplier);
router.post('/', protect, authorize('admin'), c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
