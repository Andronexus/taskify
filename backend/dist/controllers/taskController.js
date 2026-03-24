"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskById = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const Task_1 = __importDefault(require("../models/Task"));
const errorHandler_1 = require("../middleware/errorHandler");
const getTasks = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { status, priority, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
        const whereClause = { user_id: userId };
        if (status && ['todo', 'in_progress', 'completed'].includes(status)) {
            whereClause.status = status;
        }
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            whereClause.priority = priority;
        }
        if (search && typeof search === 'string' && search.trim()) {
            whereClause[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search.trim()}%` } },
                { description: { [sequelize_1.Op.like]: `%${search.trim()}%` } },
            ];
        }
        const validSortFields = ['createdAt', 'updatedAt', 'title', 'due_date', 'priority', 'status'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const tasks = await Task_1.default.findAll({
            where: whereClause,
            order: [[sortField, order]],
        });
        // Stats
        const allUserTasks = await Task_1.default.findAll({ where: { user_id: userId } });
        const stats = {
            total: allUserTasks.length,
            todo: allUserTasks.filter(t => t.status === 'todo').length,
            in_progress: allUserTasks.filter(t => t.status === 'in_progress').length,
            completed: allUserTasks.filter(t => t.status === 'completed').length,
        };
        res.status(200).json({
            success: true,
            data: { tasks, stats },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const userId = req.userId;
        const { title, description, status, priority, due_date } = req.body;
        const task = await Task_1.default.create({
            user_id: userId,
            title: title.trim(),
            description: description?.trim() || '',
            status: status || 'todo',
            priority: priority || 'medium',
            due_date: due_date ? new Date(due_date) : null,
        });
        res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: { task },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const userId = req.userId;
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            next((0, errorHandler_1.createError)('Invalid task ID.', 400));
            return;
        }
        const task = await Task_1.default.findOne({ where: { id: taskId, user_id: userId } });
        if (!task) {
            next((0, errorHandler_1.createError)('Task not found or you do not have permission to modify it.', 404));
            return;
        }
        const { title, description, status, priority, due_date } = req.body;
        await task.update({
            ...(title !== undefined && { title: title.trim() }),
            ...(description !== undefined && { description: description.trim() }),
            ...(status !== undefined && { status: status }),
            ...(priority !== undefined && { priority: priority }),
            ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        });
        res.status(200).json({
            success: true,
            message: 'Task updated successfully.',
            data: { task },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
    try {
        const userId = req.userId;
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            next((0, errorHandler_1.createError)('Invalid task ID.', 400));
            return;
        }
        const task = await Task_1.default.findOne({ where: { id: taskId, user_id: userId } });
        if (!task) {
            next((0, errorHandler_1.createError)('Task not found or you do not have permission to delete it.', 404));
            return;
        }
        await task.destroy();
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
const getTaskById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            next((0, errorHandler_1.createError)('Invalid task ID.', 400));
            return;
        }
        const task = await Task_1.default.findOne({ where: { id: taskId, user_id: userId } });
        if (!task) {
            next((0, errorHandler_1.createError)('Task not found.', 404));
            return;
        }
        res.status(200).json({
            success: true,
            data: { task },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskById = getTaskById;
//# sourceMappingURL=taskController.js.map