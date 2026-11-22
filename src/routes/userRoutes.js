const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require('../schemas/userSchemas');

const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.post('/refresh', validate(refreshSchema), userController.refresh);
router.post('/logout', requireAuth, userController.logout);

module.exports = router;
