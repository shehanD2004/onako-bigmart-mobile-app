const router = require('express').Router();
const c = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', protect, c.getAll);
router.get('/:id', protect, c.getOne);
router.post('/', protect, authorize('admin'), c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);
module.exports = router;
