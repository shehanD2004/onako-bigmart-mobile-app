const router = require('express').Router();
const c = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', c.getTree);
router.get('/flat', c.getFlat);
router.get('/:id', c.getOne);
router.post('/', protect, authorize('admin', 'warehouse_mgr'), c.create);
router.put('/:id', protect, authorize('admin', 'warehouse_mgr'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
