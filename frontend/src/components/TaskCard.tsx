import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import s from './TaskCard.module.css';

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  isDeleting: boolean;
  style?: React.CSSProperties;
}

const priorityConfig = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '↑' },
  medium: { label: 'Med',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '→' },
  low:    { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: '↓' },
};

const statusConfig = {
  todo:        { label: 'To Do',       color: 'var(--text-muted)',  next: 'in_progress' as TaskStatus, icon: '○' },
  in_progress: { label: 'In Progress', color: 'var(--amber)',       next: 'completed'   as TaskStatus, icon: '◐' },
  completed:   { label: 'Completed',   color: 'var(--green)',       next: 'todo'        as TaskStatus, icon: '●' },
};

const formatDue = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === 0) return { text: 'Due today', overdue: false };
  if (diff === 1) return { text: 'Due tomorrow', overdue: false };
  return { text: `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, overdue: false };
};

const TaskCard: React.FC<Props> = ({ task, onEdit, onDelete, onStatusChange, isDeleting, style }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const p = priorityConfig[task.priority];
  const st = statusConfig[task.status];
  const due = formatDue(task.due_date);

  return (
    <div
      className={`${s.card} ${task.status === 'completed' ? s.done : ''} animate-fade-up`}
      style={{ opacity: isDeleting ? 0.4 : 1, pointerEvents: isDeleting ? 'none' : 'auto', ...style }}
    >
      {/* Priority stripe */}
      <div className={s.stripe} style={{ background: p.color }} />

      <div className={s.cardInner}>
        {/* Top row */}
        <div className={s.topRow}>
          <div className={s.badges}>
            <span className={s.priorityBadge} style={{ color: p.color, background: p.bg }}>
              {p.icon} {p.label}
            </span>
            <button className={s.statusBadge} onClick={() => onStatusChange(st.next)}
              title="Click to advance status" style={{ color: st.color }}>
              {st.icon} {st.label}
            </button>
          </div>
          <div className={s.menuWrap}>
            <button className={s.dotsBtn}
              onClick={() => setMenuOpen(v => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/>
              </svg>
            </button>
            {menuOpen && (
              <div className={s.menu}>
                <button className={s.menuItem} onClick={() => { onEdit(); setMenuOpen(false); }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                  Edit task
                </button>
                <button className={`${s.menuItem} ${s.danger}`} onClick={() => { onDelete(); setMenuOpen(false); }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V2h4v2M5 4v9h6V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={s.title}>{task.title}</h3>

        {/* Description */}
        {task.description && <p className={s.desc}>{task.description}</p>}

        {/* Footer */}
        <div className={s.footer}>
          <div className={s.dates}>
            <span className={s.created}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 1v4M11 1v4M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {due && (
              <span className={s.due} style={{ color: due.overdue ? 'var(--red)' : 'var(--text-muted)' }}>
                {due.overdue && '⚠ '}{due.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
