const express = require('express');
const productController = require('../controllers/productController');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const {
  createProductSchema,
  updateProductSchema,
} = require('../schemas/productSchemas');

const router = express.Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

router.post(
  '/',
  requireAuth,
  validate(createProductSchema),
  productController.create,
);

router.patch(
  '/:id',
  requireAuth,
  validate(updateProductSchema),
  productController.update,
);

router.delete('/:id', requireAuth, requireRole('admin'), productController.remove);

module.exports = router;
