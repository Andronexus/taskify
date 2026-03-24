"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_1.authenticate);
const taskValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required.')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters.'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['todo', 'in_progress', 'completed'])
        .withMessage('Status must be todo, in_progress, or completed.'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high.'),
    (0, express_validator_1.body)('due_date').optional().isISO8601().withMessage('Due date must be a valid date.'),
];
const updateValidation = [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters.'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['todo', 'in_progress', 'completed'])
        .withMessage('Status must be todo, in_progress, or completed.'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high.'),
    (0, express_validator_1.body)('due_date').optional().isISO8601().withMessage('Due date must be a valid date.'),
];
// GET /api/tasks
router.get('/', taskController_1.getTasks);
// GET /api/tasks/:id
router.get('/:id', taskController_1.getTaskById);
// POST /api/tasks
router.post('/', taskValidation, taskController_1.createTask);
// PUT /api/tasks/:id
router.put('/:id', updateValidation, taskController_1.updateTask);
// DELETE /api/tasks/:id
router.delete('/:id', taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map