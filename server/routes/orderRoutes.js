const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getMyOrders);
router.post('/', c.createOrder);
router.get('/:id', c.getOrder);
router.post('/:id/pay', c.payOrder);
router.put('/:id/cancel', c.cancelOrder);

module.exports = router;
