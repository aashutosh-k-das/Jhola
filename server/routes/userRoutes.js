const router = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { loginLimiter, loginIpLimiter, signupLimiter, otpLimiter } = require('../middleware/security');

router.post('/register', signupLimiter, c.register);
router.post('/login', loginIpLimiter, loginLimiter, c.login);
router.post('/otp/send', otpLimiter, c.sendOtp);
router.post('/otp/verify', otpLimiter, c.verifyOtp);

router.get('/me', protect, c.getMe);
router.put('/me', protect, c.updateMe);

router.get('/wishlist', protect, c.getWishlist);
router.post('/wishlist/:productId', protect, c.toggleWishlist);

router.get('/addresses', protect, c.getAddresses);
router.post('/addresses', protect, c.addAddress);
router.put('/addresses/:addressId', protect, c.updateAddress);
router.delete('/addresses/:addressId', protect, c.deleteAddress);

module.exports = router;
