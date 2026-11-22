const express = require('express');
const productController = require('../controllers/productController');
const validate = require('../middlewares/validate');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const { clearCache } = cacheMiddleware;
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const {
  createProductSchema,
  updateProductSchema,
} = require('../schemas/productSchemas');

const router = express.Router();

router.get('/', cacheMiddleware(Number(process.env.CACHE_TTL || 60)), productController.getAll);
router.get('/:id', productController.getById);

router.post(
  '/',
  requireAuth,
  validate(createProductSchema),
  clearCache,
  productController.create,
);

router.patch(
  '/:id',
  requireAuth,
  validate(updateProductSchema),
  clearCache,
  productController.update,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  clearCache,
  productController.remove,
);

module.exports = router;
