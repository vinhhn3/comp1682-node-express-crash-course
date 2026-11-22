const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../schemas/userSchemas');

const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

module.exports = router;
