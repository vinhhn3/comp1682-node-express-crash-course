const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { registerSchema } = require('../schemas/userSchemas');

const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);

module.exports = router;
