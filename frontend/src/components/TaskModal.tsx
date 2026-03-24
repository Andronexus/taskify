import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, CreateTaskPayload } from '../types';
import s from './TaskModal.module.css';

interface Props {
  task: Task | null;
  onSave: (data: CreateTaskPayload) => Promise<void>;
  onClose: () => void;
}

const TaskModal: React.FC<Props> = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState<CreateTaskPayload>({
    title: '', description: '', status: 'todo', priority: 'medium', due_date: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    });
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) { setError('Task title is required.'); return; }
    setIsSaving(true);
    try {
      await onSave({ ...form, title: form.title!.trim(), description: form.description?.trim() || '', due_date: form.due_date || undefined });
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to save.');
    } finally { setIsSaving(false); }
  };

  return (
    <div className={s.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.header}>
          <div>
            <h2 className={s.title}>{task ? 'Edit Task' : 'New Task'}</h2>
            <p className={s.sub}>{task ? 'Update the details below' : 'Add a new task to your board'}</p>
          </div>
          <button className={s.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {error && <div className={s.error}><span>⚠</span>{error}</div>}

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Title <span className={s.req}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="What needs to be done?" className={s.input} autoFocus />
          </div>
          <div className={s.field}>
            <label className={s.label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Add details, notes, or acceptance criteria…" className={s.textarea} rows={3} />
          </div>
          <div className={s.row3}>
            <div className={s.field}>
              <label className={s.label}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={s.select}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className={s.select}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Due Date</label>
              <input type="date" name="due_date" value={form.due_date} onChange={handleChange}
                className={s.input} min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div className={s.actions}>
            <button type="button" className={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={s.saveBtn} disabled={isSaving}>
              {isSaving && <span className={s.spinner} />}
              {isSaving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
