const express = require('express');
const productController = require('../controllers/productController');
const validate = require('../middlewares/validate');
const {
  createProductSchema,
  updateProductSchema,
} = require('../schemas/productSchemas');

const router = express.Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', validate(createProductSchema), productController.create);
router.patch('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
