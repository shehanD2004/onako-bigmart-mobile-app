const router = require('express').Router();
const c = require('../controllers/supplierDeliveryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'warehouse_mgr', 'staff'), c.getAll);
router.get('/:id', protect, c.getOne);
router.post('/', protect, authorize('admin', 'warehouse_mgr', 'staff'), c.create);
router.put('/:id', protect, authorize('admin', 'warehouse_mgr', 'staff'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

// NEW ENDPOINT: Dispute resolution
router.patch('/:id/dispute', protect, authorize('admin', 'warehouse_mgr', 'finance'), async (req, res, next) => {
    try {
        const procurementService = require('../services/procurementService');
        const { disputeStatus, resolutionAction, resolutionNotes } = req.body;
        const delivery = await procurementService.recordDispute(req.params.id, disputeStatus, resolutionAction, resolutionNotes);
        res.json({ success: true, data: delivery });
    } catch(err) { next(err); }
});

module.exports = router;
