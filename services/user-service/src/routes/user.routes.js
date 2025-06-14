const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validation/user.validation');

// Endpointy publiczne
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Endpointy chronione
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, validate(updateProfileSchema), userController.updateProfile);

// Endpointy administratora
router.get('/', verifyToken, requireRole(['administrator']), userController.getAllUsers);

module.exports = router; 