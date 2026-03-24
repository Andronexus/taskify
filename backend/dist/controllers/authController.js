"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const generateToken = (userId, username) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({ id: userId, username }, secret, { expiresIn });
};
const register = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { username, email, password } = req.body;
        const existingUser = await User_1.default.findOne({
            where: { email },
        });
        if (existingUser) {
            next((0, errorHandler_1.createError)('An account with this email already exists.', 409));
            return;
        }
        const existingUsername = await User_1.default.findOne({ where: { username } });
        if (existingUsername) {
            next((0, errorHandler_1.createError)('This username is already taken.', 409));
            return;
        }
        const user = await User_1.default.create({ username, email, password });
        const token = generateToken(user.id, user.username);
        res.status(201).json({
            success: true,
            message: 'Account created successfully. Welcome to TaskFlow!',
            data: {
                token,
                user: user.toSafeJSON(),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            next((0, errorHandler_1.createError)('Invalid email or password.', 401));
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            next((0, errorHandler_1.createError)('Invalid email or password.', 401));
            return;
        }
        const token = generateToken(user.id, user.username);
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.username}!`,
            data: {
                token,
                user: user.toSafeJSON(),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            next((0, errorHandler_1.createError)('Not authenticated.', 401));
            return;
        }
        res.status(200).json({
            success: true,
            data: { user: req.user.toSafeJSON() },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
// Change Password (no email needed — just username + new password)
const changePassword = async (req, res) => {
    try {
        const { username, newPassword, confirmPassword } = req.body;
        if (!username || !newPassword || !confirmPassword) {
            res.status(400).json({ success: false, message: 'All fields are required.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ success: false, message: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
            return;
        }
        if (!/\d/.test(newPassword)) {
            res.status(400).json({ success: false, message: 'Password must contain at least one number.' });
            return;
        }
        // ✅ Use top-level imported User — no dynamic import needed
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            res.status(404).json({ success: false, message: 'No account found with that username.' });
            return;
        }
        // Model's beforeUpdate hook handles hashing automatically
        await user.update({ password: newPassword });
        res.json({ success: true, message: 'Password changed successfully!' });
    }
    catch (error) {
        console.error('changePassword error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map