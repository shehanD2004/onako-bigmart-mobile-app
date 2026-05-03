const router = require('express').Router();
const c = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getAll);
router.get('/:id', protect, c.getOne);
router.get('/:id/performance', protect, c.getPerformance);
router.post('/', protect, authorize('admin'), c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.patch('/:id/status', protect, authorize('admin'), c.toggleStatus);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
