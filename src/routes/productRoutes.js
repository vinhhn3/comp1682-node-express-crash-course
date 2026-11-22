const express = require('express');
const productController = require('../controllers/productController');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const config = require('../config');
const { clearCache } = cacheMiddleware;
const {
  createProductSchema,
  updateProductSchema,
} = require('../schemas/productSchemas');

const router = express.Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Case-insensitive match on title, category or description.
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Exact category match.
 *     responses:
 *       200:
 *         description: An array of products
 *         headers:
 *           X-Total-Count:
 *             schema: { type: integer }
 *           X-Cache:
 *             schema: { type: string, enum: [HIT, MISS] }
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', cacheMiddleware(config.cacheTtlSeconds), productController.getAll);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get one product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The product
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: The id is not a valid ObjectId
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No product with that id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', productController.getById);

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
  '/',
  requireAuth,
  validate(createProductSchema),
  clearCache,
  productController.create,
);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update some fields of a product
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: No product with that id
 */
router.patch(
  '/:id',
  requireAuth,
  validate(updateProductSchema),
  clearCache,
  productController.update,
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted, no body
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: The token is not an admin
 *       404:
 *         description: No product with that id
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  clearCache,
  productController.remove,
);

module.exports = router;
