const router = require('express').Router();
const c = require('../controllers/storeController');

router.get('/products', c.getProducts);
router.get('/products/:slug', c.getProductBySlug);
router.get('/categories', c.getCategories);
router.get('/featured', c.getFeatured);

module.exports = router;
