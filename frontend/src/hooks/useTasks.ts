import { useState, useCallback } from 'react';
import { Task, TaskStats, TaskFilters, CreateTaskPayload, UpdateTaskPayload } from '../types';
import { tasksApi } from '../api';

interface UseTasksReturn {
  tasks: Task[];
  stats: TaskStats;
  isLoading: boolean;
  error: string | null;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (data: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: number, data: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
}

const defaultStats: TaskStats = { total: 0, todo: 0, in_progress: 0, completed: 0 };

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tasksApi.getAll(filters);
      if (res.data.data) {
        setTasks(res.data.data.tasks);
        setStats(res.data.data.stats);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskPayload): Promise<Task> => {
    const res = await tasksApi.create(data);
    const newTask = res.data.data!.task;
    setTasks((prev) => [newTask, ...prev]);
    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      [newTask.status]: prev[newTask.status] + 1,
    }));
    return newTask;
  }, []);

  const updateTask = useCallback(async (id: number, data: UpdateTaskPayload): Promise<Task> => {
    const res = await tasksApi.update(id, data);
    const updated = res.data.data!.task;
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    // Refresh stats after update
    const statsRes = await tasksApi.getAll();
    if (statsRes.data.data) setStats(statsRes.data.data.stats);
    return updated;
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    const taskToDelete = tasks.find((t) => t.id === id);
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (taskToDelete) {
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        [taskToDelete.status]: Math.max(0, prev[taskToDelete.status] - 1),
      }));
    }
  }, [tasks]);

  return { tasks, stats, isLoading, error, fetchTasks, createTask, updateTask, deleteTask, clearError: () => setError(null) };
};
