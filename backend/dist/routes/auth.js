"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters.')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores.'),
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.')
        .matches(/\d/)
        .withMessage('Password must contain at least one number.'),
];
const loginValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required.'),
];
// POST /api/auth/register
router.post('/register', registerValidation, authController_1.register);
// POST /api/auth/login
router.post('/login', loginValidation, authController_1.login);
// GET /api/auth/me
router.get('/me', auth_1.authenticate, authController_1.getMe);
router.post('/change-password', authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map