import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskFilters, TaskStatus, CreateTaskPayload } from '../types';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ThemeToggle from '../components/ThemeToggle';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import s from './Dashboard.module.css';

// ── Logo ──────────────────────────────────────────────────
const Logo = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
    <path d="M16 2L29 9.5V22.5L16 30L3 22.5V9.5L16 2Z"
      stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-glow)"/>
    <path d="M16 9L22 12.5V19.5L16 23L10 19.5V12.5L16 9Z"
      fill="var(--accent)" opacity="0.35"/>
  </svg>
);

// ── Mini donut chart ──────────────────────────────────────
const DonutChart: React.FC<{ todo: number; inProgress: number; completed: number; total: number }> = ({ todo, inProgress, completed, total }) => {
  const r = 38; const cx = 44; const cy = 44;
  const circ = 2 * Math.PI * r;
  const pct = (n: number) => total > 0 ? n / total : 0;
  const todoD = pct(todo) * circ;
  const inD   = pct(inProgress) * circ;
  const doneD = pct(completed) * circ;
  const todoOffset = 0;
  const inOffset   = -todoD;
  const doneOffset = -(todoD + inD);
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth="10"/>
      {total > 0 && <>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--text-muted)" strokeWidth="10"
          strokeDasharray={`${todoD} ${circ - todoD}`}
          strokeDashoffset={`${circ / 4 + todoOffset}`}
          style={{ transition: 'stroke-dasharray .8s ease' }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--amber)" strokeWidth="10"
          strokeDasharray={`${inD} ${circ - inD}`}
          strokeDashoffset={`${circ / 4 + inOffset}`}
          style={{ transition: 'stroke-dasharray .8s ease' }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--green)" strokeWidth="10"
          strokeDasharray={`${doneD} ${circ - doneD}`}
          strokeDashoffset={`${circ / 4 + doneOffset}`}
          style={{ transition: 'stroke-dasharray .8s ease' }}
        />
      </>}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text-primary)">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="var(--text-muted)">Total</text>
    </svg>
  );
};

// ── Bar chart (priority breakdown) ────────────────────────
const BarChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const high   = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low    = tasks.filter(t => t.priority === 'low').length;
  const max    = Math.max(high, medium, low, 1);
  const bars   = [
    { label: 'High',   value: high,   color: 'var(--red)' },
    { label: 'Medium', value: medium, color: 'var(--amber)' },
    { label: 'Low',    value: low,    color: 'var(--green)' },
  ];
  return (
    <div className={s.barChart}>
      {bars.map(b => (
        <div key={b.label} className={s.barRow}>
          <span className={s.barLabel}>{b.label}</span>
          <div className={s.barTrack}>
            <div className={s.barFill}
              style={{ width: `${(b.value / max) * 100}%`, background: b.color }} />
          </div>
          <span className={s.barVal}>{b.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Activity heatmap (last 7 days) ────────────────────────
const ActivityChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateStr = d.toISOString().split('T')[0];
      const count = tasks.filter(t => t.createdAt.startsWith(dateStr)).length;
      result.push({ label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), count, ds });
    }
    return result;
  }, [tasks]);
  const max = Math.max(...days.map(d => d.count), 1);
  const H = 60;
  return (
    <div className={s.actChart}>
      {days.map((d, i) => (
        <div key={i} className={s.actCol}>
          <div className={s.actBarWrap} style={{ height: H }}>
            <div className={s.actBar}
              style={{
                height: `${Math.max((d.count / max) * H, d.count > 0 ? 6 : 2)}px`,
                background: d.count > 0 ? 'var(--accent)' : 'var(--bg-3)',
                opacity: d.count > 0 ? 1 : 0.4,
              }}
            />
          </div>
          <span className={s.actLabel}>{d.label}</span>
          <span className={s.actCount}>{d.count}</span>
        </div>
      ))}
    </div>
  );
};

// ── KanbanColumn ──────────────────────────────────────────
const KanbanColumn: React.FC<{
  title: string; status: TaskStatus; tasks: Task[];
  count: number; color: string; bg: string;
  onEdit: (t: Task) => void; onDelete: (id: number) => void;
  onStatusChange: (t: Task, st: TaskStatus) => void;
  deletingId: number | null; onAdd: (st: TaskStatus) => void;
}> = ({ title, status, tasks, count, color, bg, onEdit, onDelete, onStatusChange, deletingId, onAdd }) => (
  <div className={s.col}>
    <div className={s.colHead}>
      <div className={s.colMeta}>
        <span className={s.colDot} style={{ background: color }} />
        <span className={s.colTitle}>{title}</span>
        <span className={s.colBadge} style={{ background: bg, color }}>{count}</span>
      </div>
      <button className={s.colAdd} onClick={() => onAdd(status)}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
    <div className={s.colBody}>
      {tasks.length === 0 ? (
        <div className={s.colEmpty}>
          <p>No tasks</p>
          <button onClick={() => onAdd(status)}>+ Add task</button>
        </div>
      ) : tasks.map((task, i) => (
        <TaskCard key={task.id} task={task}
          style={{ animationDelay: `${i * 35}ms` }}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onStatusChange={st => onStatusChange(task, st)}
          isDeleting={deletingId === task.id}
        />
      ))}
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { tasks, stats, isLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filters, setFilters] = useState<TaskFilters>({ status: '', priority: '', search: '', sortBy: 'createdAt', sortOrder: 'DESC' });
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showForgotPw, setShowForgotPw] = useState(false); // ← NEW

  const loadTasks = useCallback(() => {
    const f: TaskFilters = {};
    if (filters.priority) f.priority = filters.priority;
    if (filters.search)   f.search   = filters.search;
    if (filters.sortBy)   f.sortBy   = filters.sortBy;
    if (filters.sortOrder) f.sortOrder = filters.sortOrder;
    fetchTasks(f);
  }, [filters, fetchTasks]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: searchInput })), 320);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openCreate = (st: TaskStatus = 'todo') => { setDefaultStatus(st); setEditingTask(null); setIsModalOpen(true); };
  const openEdit   = (task: Task) => { setEditingTask(task); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingTask(null); };

  const handleSave = async (data: CreateTaskPayload) => {
    if (editingTask) await updateTask(editingTask.id, data);
    else await createTask({ ...data, status: data.status || defaultStatus });
    closeModal(); loadTasks();
  };
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try { await deleteTask(id); } finally { setDeletingId(null); }
  };
  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    await updateTask(task.id, { status }); loadTasks();
  };

  const todo       = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed  = tasks.filter(t => t.status === 'completed');
  const highPri    = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
  const overdue    = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  const pct        = (n: number) => stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;
  const filteredTasks = filters.status ? tasks.filter(t => t.status === filters.status) : tasks;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={s.root}>

      {/* ── SIDEBAR ── */}
      <aside className={`${s.sidebar} ${sideCollapsed ? s.sideClosed : ''}`}>
        <div className={s.sideTop}>
          <div className={s.brand}>
            <Logo />
            {!sideCollapsed && <span className={s.brandName}>Taskify</span>}
          </div>
          <button className={s.sideToggle} onClick={() => setSideCollapsed(v => !v)}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d={sideCollapsed ? "M4 2l6 5-6 5" : "M10 2L4 7l6 5"}
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {!sideCollapsed && <>
          <div className={s.profile}>
            <div className={s.avatar}>{user?.username?.charAt(0).toUpperCase()}</div>
            <div>
              <p className={s.profileName}>{user?.username}</p>
              <p className={s.profileRole}>Member</p>
            </div>
          </div>

          <div className={s.donutWrap}>
            <DonutChart todo={stats.todo} inProgress={stats.in_progress} completed={stats.completed} total={stats.total}/>
            <div className={s.donutLegend}>
              {[
                { c: 'var(--text-muted)', l: 'To Do',       n: stats.todo },
                { c: 'var(--amber)',      l: 'In Progress',  n: stats.in_progress },
                { c: 'var(--green)',      l: 'Completed',    n: stats.completed },
              ].map(item => (
                <div key={item.l} className={s.legendRow}>
                  <span className={s.legendDot} style={{ background: item.c }} />
                  <span className={s.legendLabel}>{item.l}</span>
                  <span className={s.legendN}>{item.n}</span>
                </div>
              ))}
            </div>
          </div>

          <nav className={s.nav}>
            <p className={s.navSect}>Filters</p>
            {[
              { key: '',            label: 'All Tasks',   n: stats.total },
              { key: 'todo',        label: 'To Do',       n: stats.todo },
              { key: 'in_progress', label: 'In Progress', n: stats.in_progress },
              { key: 'completed',   label: 'Completed',   n: stats.completed },
            ].map(item => (
              <button key={item.key}
                className={`${s.navBtn} ${(filters.status || '') === item.key ? s.navActive : ''}`}
                onClick={() => setFilters(f => ({ ...f, status: item.key as any }))}>
                <span>{item.label}</span>
                <span className={s.navN}>{item.n}</span>
              </button>
            ))}
          </nav>

          {/* ── SIDEBAR FOOTER ── */}
          <div className={s.sideFoot}>
            <div className={s.themeRow}>
              <span className={s.themeLabel}>Theme</span>
              <ThemeToggle />
            </div>

            {/* ── FORGOT PASSWORD BUTTON (new) ── */}
            <button className={s.logoutBtn} onClick={() => setShowForgotPw(true)}
              style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Forgot Password
            </button>

            {/* ── SIGN OUT ── */}
            <button className={s.logoutBtn} onClick={logout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </>}
      </aside>

      {/* ── MAIN ── */}
      <main className={s.main}>

        {/* Topbar */}
        <div className={s.topbar}>
          <div>
            <h1 className={s.greeting}>{greeting()}, <em>{user?.username}</em></h1>
            <p className={s.greetSub}>
              {overdue > 0
                ? <span style={{ color: 'var(--red)' }}>⚠ {overdue} overdue · </span>
                : null}
              {stats.in_progress > 0 ? `${stats.in_progress} in progress · ` : ''}
              {pct(stats.completed)}% complete
            </p>
          </div>
          <div className={s.topRight}>
            <button className={`${s.analyticsToggle} ${showAnalytics ? s.analyticsActive : ''}`}
              onClick={() => setShowAnalytics(v => !v)}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M2 14V9M6 14V5M10 14V8M14 14V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Analytics
            </button>
            <div className={s.viewSwitch}>
              <button className={`${s.vsBtn} ${view === 'kanban' ? s.vsActive : ''}`} onClick={() => setView('kanban')}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="1" y="1" width="3" height="12" rx="1"/>
                  <rect x="5.5" y="1" width="3" height="9" rx="1"/>
                  <rect x="10" y="1" width="3" height="10" rx="1"/>
                </svg>
                Board
              </button>
              <button className={`${s.vsBtn} ${view === 'list' ? s.vsActive : ''}`} onClick={() => setView('list')}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3.5h12M1 7h12M1 10.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                List
              </button>
            </div>
            <div className={s.searchBox}>
              <svg className={s.searchIco} width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input className={s.searchInput} placeholder="Search tasks…"
                value={searchInput} onChange={e => setSearchInput(e.target.value)}/>
            </div>
            <select className={s.filterSel} value={filters.priority || ''}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value as any }))}>
              <option value="">All priorities</option>
              <option value="high">↑ High</option>
              <option value="medium">→ Medium</option>
              <option value="low">↓ Low</option>
            </select>
            <button className={s.newBtn} onClick={() => openCreate()}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Task
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className={s.statsStrip}>
          {[
            { label: 'Total',       value: stats.total,       color: 'var(--accent)',       sub: 'all tasks' },
            { label: 'To Do',       value: stats.todo,        color: 'var(--text-secondary)', sub: `${pct(stats.todo)}%` },
            { label: 'In Progress', value: stats.in_progress, color: 'var(--amber)',         sub: `${pct(stats.in_progress)}%` },
            { label: 'Completed',   value: stats.completed,   color: 'var(--green)',         sub: `${pct(stats.completed)}%` },
            { label: 'High Priority', value: tasks.filter(t=>t.priority==='high').length, color:'var(--red)', sub: 'priority' },
            { label: 'Overdue',     value: overdue,           color: overdue > 0 ? 'var(--red)' : 'var(--text-muted)', sub: 'need attention' },
          ].map(st => (
            <div key={st.label} className={s.statCard}>
              <div className={s.statTop}>
                <span className={s.statLbl}>{st.label}</span>
                <span className={s.statSub} style={{ color: st.color }}>{st.sub}</span>
              </div>
              <span className={s.statVal} style={{ color: st.color }}>{st.value}</span>
            </div>
          ))}
        </div>

        {/* Analytics panel */}
        {showAnalytics && (
          <div className={s.analyticsPanel}>
            <div className={s.analyticsCard}>
              <p className={s.analyticsTitle}>Priority Breakdown</p>
              <BarChart tasks={tasks} />
            </div>
            <div className={s.analyticsCard}>
              <p className={s.analyticsTitle}>Tasks Created — Last 7 Days</p>
              <ActivityChart tasks={tasks} />
            </div>
            <div className={s.analyticsCard}>
              <p className={s.analyticsTitle}>Completion Rate</p>
              <div className={s.completionWrap}>
                <div className={s.completionRing}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg-3)" strokeWidth="8"/>
                    <circle cx="45" cy="45" r="36" fill="none" stroke="var(--green)" strokeWidth="8"
                      strokeDasharray={`${2*Math.PI*36}`}
                      strokeDashoffset={`${2*Math.PI*36 * (1 - pct(stats.completed)/100)}`}
                      strokeLinecap="round" transform="rotate(-90 45 45)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                    <text x="45" y="49" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--green)">{pct(stats.completed)}%</text>
                  </svg>
                </div>
                <div className={s.completionStats}>
                  <div className={s.cStat}>
                    <span className={s.cStatVal} style={{ color:'var(--green)' }}>{stats.completed}</span>
                    <span className={s.cStatLabel}>Done</span>
                  </div>
                  <div className={s.cStat}>
                    <span className={s.cStatVal} style={{ color:'var(--amber)' }}>{stats.in_progress}</span>
                    <span className={s.cStatLabel}>Active</span>
                  </div>
                  <div className={s.cStat}>
                    <span className={s.cStatVal} style={{ color:'var(--text-muted)' }}>{stats.todo}</span>
                    <span className={s.cStatLabel}>Queued</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Board / List */}
        {isLoading ? (
          <div className={s.skelGrid}>
            {[...Array(6)].map((_, i) => <div key={i} className={s.skel}/>)}
          </div>
        ) : view === 'kanban' ? (
          <div className={s.kanban}>
            <KanbanColumn title="To Do" status="todo"
              tasks={filters.status && filters.status !== 'todo' ? [] : todo}
              count={stats.todo} color="var(--text-secondary)" bg="var(--bg-3)"
              onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange}
              deletingId={deletingId} onAdd={openCreate}/>
            <KanbanColumn title="In Progress" status="in_progress"
              tasks={filters.status && filters.status !== 'in_progress' ? [] : inProgress}
              count={stats.in_progress} color="var(--amber)" bg="var(--amber-bg)"
              onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange}
              deletingId={deletingId} onAdd={openCreate}/>
            <KanbanColumn title="Completed" status="completed"
              tasks={filters.status && filters.status !== 'completed' ? [] : completed}
              count={stats.completed} color="var(--green)" bg="var(--green-bg)"
              onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange}
              deletingId={deletingId} onAdd={openCreate}/>
          </div>
        ) : (
          <div className={s.listWrap}>
            {filteredTasks.length === 0 ? (
              <div className={s.empty}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <rect x="6" y="6" width="32" height="32" rx="6" stroke="var(--text-muted)" strokeWidth="1.5"/>
                  <path d="M14 22h16M14 16h10M14 28h8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className={s.emptyTitle}>No tasks found</p>
                <p className={s.emptySub}>{searchInput || filters.priority ? 'Try adjusting filters' : 'Create your first task'}</p>
                {!searchInput && !filters.priority && <button className={s.emptyBtn} onClick={() => openCreate()}>Create task</button>}
              </div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr className={s.thead}>
                    <th>Task</th><th>Status</th><th>Priority</th><th>Due</th><th>Created</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, i) => {
                    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                    return (
                      <tr key={task.id} className={`${s.trow} animate-fade-up`} style={{ animationDelay:`${i*25}ms` }}>
                        <td>
                          <div className={s.tdMain}>
                            <span className={s.tdDot} style={{ background: task.priority==='high' ? 'var(--red)' : task.priority==='medium' ? 'var(--amber)' : 'var(--green)' }}/>
                            <div>
                              <p className={`${s.tdTitle} ${task.status==='completed' ? s.struck : ''}`}>{task.title}</p>
                              {task.description && <p className={s.tdDesc}>{task.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={s.tdStatus} style={{ color: task.status==='completed'?'var(--green)':task.status==='in_progress'?'var(--amber)':'var(--text-muted)', background: task.status==='completed'?'var(--green-bg)':task.status==='in_progress'?'var(--amber-bg)':'var(--bg-3)' }}>
                            {task.status==='todo'?'To Do':task.status==='in_progress'?'In Progress':'Done'}
                          </span>
                        </td>
                        <td><span className={s.tdPri} style={{ color: task.priority==='high'?'var(--red)':task.priority==='medium'?'var(--amber)':'var(--green)' }}>{task.priority}</span></td>
                        <td className={s.tdDate} style={{ color: overdue?'var(--red)':'var(--text-muted)' }}>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                        </td>
                        <td className={s.tdDate}>{new Date(task.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                        <td>
                          <div className={s.tdActs}>
                            <button className={s.tdBtn} onClick={() => openEdit(task)}>Edit</button>
                            <button className={`${s.tdBtn} ${s.tdBtnDel}`} onClick={() => handleDelete(task.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {isModalOpen && <TaskModal task={editingTask} onSave={handleSave} onClose={closeModal}/>}
      {showForgotPw && <ForgotPasswordModal onClose={() => setShowForgotPw(false)} />}

    </div>
  );
};

export default DashboardPage;