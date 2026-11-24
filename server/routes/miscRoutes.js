const router = require('express').Router();
const multer = require('multer');
const { getCategories, checkDelivery, getLocations } = require('../controllers/productController');
const { uploadImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

router.get('/categories', getCategories);
router.get('/delivery/:district', checkDelivery);
router.get('/locations', getLocations);
router.post('/upload', protect, admin, upload.single('image'), uploadImage);

module.exports = router;
