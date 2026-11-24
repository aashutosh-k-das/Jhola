const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', c.getProducts);
router.post('/', protect, admin, c.createProduct);
router.get('/brands', c.getBrands);
router.get('/:id', c.getProduct);
router.get('/:id/reviews', c.getReviews);
router.post('/:id/reviews', protect, c.addReview);

module.exports = router;
