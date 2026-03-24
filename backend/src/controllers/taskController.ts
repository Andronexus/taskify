import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Task, { TaskStatus, TaskPriority } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const whereClause: Record<string, unknown> = { user_id: userId };

    if (status && ['todo', 'in_progress', 'completed'].includes(status as string)) {
      whereClause.status = status;
    }

    if (priority && ['low', 'medium', 'high'].includes(priority as string)) {
      whereClause.priority = priority;
    }

    if (search && typeof search === 'string' && search.trim()) {
      whereClause[Op.or as unknown as string] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'title', 'due_date', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const tasks = await Task.findAll({
      where: whereClause,
      order: [[sortField, order]],
    });

    // Stats
    const allUserTasks = await Task.findAll({ where: { user_id: userId } });
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
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const { title, description, status, priority, due_date } = req.body;

    const task = await Task.create({
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || '',
      status: (status as TaskStatus) || 'todo',
      priority: (priority as TaskPriority) || 'medium',
      due_date: due_date ? new Date(due_date) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      next(createError('Invalid task ID.', 400));
      return;
    }

    const task = await Task.findOne({ where: { id: taskId, user_id: userId } });
    if (!task) {
      next(createError('Task not found or you do not have permission to modify it.', 404));
      return;
    }

    const { title, description, status, priority, due_date } = req.body;

    await task.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(status !== undefined && { status: status as TaskStatus }),
      ...(priority !== undefined && { priority: priority as TaskPriority }),
      ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      next(createError('Invalid task ID.', 400));
      return;
    }

    const task = await Task.findOne({ where: { id: taskId, user_id: userId } });
    if (!task) {
      next(createError('Task not found or you do not have permission to delete it.', 404));
      return;
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      next(createError('Invalid task ID.', 400));
      return;
    }

    const task = await Task.findOne({ where: { id: taskId, user_id: userId } });
    if (!task) {
      next(createError('Task not found.', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};
