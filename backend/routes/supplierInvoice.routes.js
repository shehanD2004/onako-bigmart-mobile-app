const router = require('express').Router();
const c = require('../controllers/supplierInvoiceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getAll);
router.get('/:id', protect, c.getOne);
router.post('/', protect, authorize('admin', 'finance'), c.create);
router.put('/:id', protect, authorize('admin', 'finance'), c.update);
router.patch('/:id/status', protect, authorize('admin', 'finance'), c.updateStatus);
router.post('/:id/payments', protect, authorize('admin', 'finance'), c.addPayment);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
