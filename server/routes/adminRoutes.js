const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/stats', c.getStats);
router.get('/orders', c.getOrders);
router.put('/orders/:id/status', c.updateOrderStatus);
router.get('/users', c.getUsers);
router.put('/products/:id', c.updateProduct);
router.delete('/products/:id', c.deleteProduct);

module.exports = router;
