const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimitMiddleware');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require('../schemas/userSchemas');

const router = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Create an account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, minLength: 3, maxLength: 30 }
 *               password: { type: string, minLength: 8, maxLength: 72 }
 *     responses:
 *       201:
 *         description: The new user, without the password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Username already taken
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/register', validate(registerSchema), userController.register);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Exchange a password for an access and a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: A token pair
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tokens' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', loginLimiter, validate(loginSchema), userController.login);

/**
 * @openapi
 * /users/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Rotate a refresh token into a new pair
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: A new pair; the old refresh token is now dead
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tokens' }
 *       401:
 *         description: Invalid, expired or already rotated refresh token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/refresh', validate(refreshSchema), userController.refresh);

/**
 * @openapi
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Revoke the stored refresh token
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204:
 *         description: The refresh token can no longer be used
 *       401:
 *         description: Missing or invalid access token
 */
router.post('/logout', requireAuth, userController.logout);

module.exports = router;
