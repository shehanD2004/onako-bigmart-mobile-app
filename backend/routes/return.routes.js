const router = require('express').Router();
const c = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), c.getAll);
router.get('/my', protect, c.getMy);
router.get('/:id', protect, c.getOne);
router.post('/', protect, c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
