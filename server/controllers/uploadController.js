const { cloudinary, enabled } = require('../../config/cloudinary');
const HttpError = require('../utils/HttpError');

// POST /api/upload  (admin, multipart field "image")
exports.uploadImage = async (req, res) => {
  if (!enabled) throw new HttpError(503, 'Image uploads are disabled: set CLOUDINARY_* variables in config/.env');
  if (!req.file) throw new HttpError(400, 'No image provided (field name: "image")');
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'jhola/products', resource_type: 'image' }, (err, r) => (err ? reject(err) : resolve(r)))
      .end(req.file.buffer);
  });
  res.status(201).json({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
};
