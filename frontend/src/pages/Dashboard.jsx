import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Menu, LayoutGrid, Plus, LogOut, Clock,
  CheckCircle, AlertCircle, PlayCircle, ChevronLeft, ChevronRight,
  Filter, ChevronDown, X, Flag, Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import AddProjectModal from '../components/modals/AddProjectModal';

const LIMIT_OPTIONS = [6, 10, 15, 25, 50];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':   return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    case 'medium': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    case 'low':    return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    default:       return 'text-gray-400 border-gray-500/20 bg-gray-500/5';
  }
};

const getTaskStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'done':        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    case 'in-progress': return 'text-violet-400 border-violet-500/20 bg-violet-500/5';
    case 'todo':        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    default:            return 'text-gray-400 border-gray-500/20 bg-gray-500/5';
  }
};

// ── Task List Modal ───────────────────────────────────────────────────────────
const TaskListModal = ({ project, onClose, onTaskDeleted }) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    API.get(`/projects/${project.id}/tasks`, {
      params: statusFilter !== 'all' ? { status: statusFilter } : {}
    })
      .then(res => setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [project, statusFilter]);

  const todo       = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const total      = tasks.length;
  const pct        = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    try {
      setDeletingTaskId(taskId);
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (onTaskDeleted) onTaskDeleted();
    } catch (err) {
      console.error('Task delete failed:', err);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleTaskStatusChange = async (taskId, nextStatus) => {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask || currentTask.status === nextStatus) return;

    try {
      setUpdatingTaskId(taskId);
      await API.put(`/tasks/${taskId}`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task))
      );
      if (onTaskDeleted) onTaskDeleted();
    } catch (err) {
      console.error('Task status update failed:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161B22] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight">{project.name}</h2>
            {project.description && (
              <p className="text-xs text-gray-500 mt-1 italic">{project.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex justify-between items-center mb-2 gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Completion</span>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0D1117] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-gray-300 outline-none"
              >
                <option value="all">All</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <span className="text-[10px] font-bold text-violet-400">{pct}%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Mini stat pills */}
          <div className="flex gap-3 mt-4">
            <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase border text-amber-400 border-amber-500/20 bg-amber-500/5">
              Todo · {todo}
            </span>
            <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase border text-violet-400 border-violet-500/20 bg-violet-500/5">
              In Progress · {inProgress}
            </span>
            <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase border text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
              Done · {done}
            </span>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-y-auto flex-1 mt-4">
          {loading ? (
            <div className="py-16 text-center text-gray-600 text-[11px] uppercase tracking-widest font-bold animate-pulse">
              Loading Tasks…
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-[11px] uppercase tracking-widest font-bold">
              No Tasks Found
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-y border-white/5 sticky top-0">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Task</th>
                  <th className="px-6 py-3 text-center">Priority</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Due</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      #{String(task.id).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm">{task.title}</div>
                      {task.description && (
                        <div className="text-[11px] text-gray-500 mt-0.5 italic">{task.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border ${getPriorityStyle(task.priority)}`}>
                        <Flag size={8} className="inline mr-1 mb-0.5" />
                        {task.priority || 'Low'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={task.status || 'todo'}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        disabled={updatingTaskId === task.id}
                        className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border bg-transparent outline-none ${getTaskStatusStyle(task.status)} disabled:opacity-60`}
                      >
                        <option value="todo">todo</option>
                        <option value="in-progress">in-progress</option>
                        <option value="done">done</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB') : '--/--/--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id || updatingTaskId === task.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 disabled:opacity-60"
                      >
                        <Trash2 size={11} />
                        {deletingTaskId === task.id ? 'Deleting' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { logout } = useAuth();

  // Data States
  const [projects, setProjects]   = useState([]);
  const [stats, setStats]         = useState({ todo: 0, inProgress: 0, done: 0, total: 0 });

  // Control States
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [limit, setLimit]             = useState(6);
  const [sortBy, setSortBy]           = useState('created_at');
  const [sortOrder, setSortOrder]     = useState('DESC');
  const [searchProjectId, setSearchProjectId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // UI States
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen]     = useState(true);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  // ── Fetch projects + aggregate task stats ──
  const fetchProjects = useCallback(async () => {
    try {
      const res = await API.get('/projects', {
        params: { page, limit, sortBy, sortOrder }
      });

      let list = [];
      if (res.data?.projects) {
        list = res.data.projects;
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total  || 0);
      } else if (Array.isArray(res.data)) {
        list = res.data;
        setTotalPages(1);
        setTotalCount(list.length);
      }
      setProjects(list);

      // Aggregate task stats from each project's task_counts if backend provides them,
      // otherwise fall back to a separate /tasks/stats endpoint
      if (list[0]?.task_counts) {
        const agg = list.reduce((acc, p) => ({
          todo:       acc.todo       + (p.task_counts?.todo        || 0),
          inProgress: acc.inProgress + (p.task_counts?.in_progress || 0),
          done:       acc.done       + (p.task_counts?.done        || 0),
        }), { todo: 0, inProgress: 0, done: 0 });
        setStats({ ...agg, total: agg.todo + agg.inProgress + agg.done });
      } else {
        // fallback: hit a global task stats endpoint
        try {
          const s = await API.get('/tasks/stats');
          setStats({
            todo:       s.data.todo        || 0,
            inProgress: s.data.in_progress || 0,
            done:       s.data.done        || 0,
            total:      s.data.total       || 0,
          });
        } catch { /* stats unavailable */ }
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      setProjects([]);
    }
  }, [page, limit, sortBy, sortOrder]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleLimitChange = (newLimit) => { setLimit(newLimit); setPage(1); };

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd   = Math.min(page * limit, totalCount);

  const chartData = useMemo(() => [
    { name: 'Todo',        value: stats.todo,       color: '#F59E0B' },
    { name: 'In Progress', value: stats.inProgress, color: '#7C3AED' },
    { name: 'Done',        value: stats.done,        color: '#10B981' },
  ].filter(d => d.value > 0), [stats]);

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm('Delete this project and all its tasks?');
    if (!confirmed) return;

    try {
      setDeletingProjectId(projectId);
      await API.delete(`/projects/${projectId}`);
      if (selectedProject?.id === projectId) {
        setIsTaskModalOpen(false);
        setSelectedProject(null);
      }
      await fetchProjects();
    } catch (err) {
      console.error('Project delete failed:', err);
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleSearchById = async () => {
    const id = searchProjectId.trim();
    if (!/^\d+$/.test(id)) {
      setSearchError('Enter a numeric project ID only.');
      return;
    }

    try {
      setSearchError('');
      const res = await API.get(`/projects/${id}`);
      const project = res.data;
      setProjects([project]);
      setTotalPages(1);
      setTotalCount(1);
      const tc = project?.task_counts || { todo: 0, in_progress: 0, done: 0 };
      setStats({
        todo: tc.todo || 0,
        inProgress: tc.in_progress || 0,
        done: tc.done || 0,
        total: (tc.todo || 0) + (tc.in_progress || 0) + (tc.done || 0),
      });
      setIsSearchMode(true);
    } catch (err) {
      setProjects([]);
      setTotalPages(1);
      setTotalCount(0);
      setSearchError(err?.response?.data?.error || 'Project not found');
    }
  };

  const clearSearch = async () => {
    setSearchProjectId('');
    setSearchError('');
    setIsSearchMode(false);
    await fetchProjects();
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-white selection:bg-violet-500/30">

      {/* ── SIDEBAR ── */}
      <aside className={`bg-[#161B22] border-r border-white/5 flex flex-col fixed h-full z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center p-6 mb-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-violet-500">
            <Menu size={24} />
          </button>
          {isSidebarOpen && <span className="ml-4 text-xl font-bold tracking-tighter italic text-violet-500">Projectify</span>}
        </div>
        <nav className="flex-1 px-4">
          <div className="flex items-center gap-4 w-full p-3 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/10 cursor-pointer">
            <LayoutGrid size={24} />
            {isSidebarOpen && <span className="font-medium">Projects</span>}
          </div>
        </nav>
        <button onClick={logout} className="flex items-center gap-4 p-6 text-gray-500 hover:text-red-400 transition-colors mt-auto">
          <LogOut size={24} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className={`flex-1 transition-all duration-300 p-8 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>

        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter">Projects</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#161B22] border border-white/10 rounded-2xl px-3 py-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Search by Project ID"
                value={searchProjectId}
                onChange={(e) => setSearchProjectId(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchById(); }}
                className="bg-transparent outline-none text-sm w-44"
              />
              <button
                type="button"
                onClick={handleSearchById}
                className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase bg-violet-600 hover:bg-violet-700"
              >
                Search
              </button>
              {isSearchMode && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-white/15 text-gray-300 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
            >
              <Plus size={20} /> New Project
            </button>
          </div>
        </header>
        {searchError && (
          <p className="mb-4 text-rose-400 text-xs font-semibold">{searchError}</p>
        )}

        {/* ANALYTICS — task-based stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard title="Total Tasks"  count={stats.total}      icon={<LayoutGrid  className="text-violet-400" />} />
            <StatCard title="Todo"         count={stats.todo}       icon={<Clock       className="text-amber-400"  />} />
            <StatCard title="In Progress"  count={stats.inProgress} icon={<PlayCircle  className="text-violet-400" />} />
            <StatCard title="Done"         count={stats.done}       icon={<CheckCircle className="text-emerald-400"/>} />
          </div>
          <div className="bg-[#161B22] border border-white/5 rounded-3xl p-6 flex items-center justify-center h-[280px] min-w-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B0E14', border: 'none', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-600 text-[10px] uppercase font-bold tracking-widest text-center">No Task Data</div>
            )}
          </div>
        </div>

        {/* ── PROJECTS TABLE ── */}
        <div className="bg-[#161B22] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

          {/* Toolbar */}
          <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.01]">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Registry Nodes</h2>

              {/* Limit dropdown */}
              <div className="flex items-center gap-2 bg-[#0D1117] px-3 py-1.5 rounded-lg border border-white/10">
                <ChevronDown size={12} className="text-gray-500 pointer-events-none" />
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-transparent text-[10px] outline-none text-violet-400 font-bold uppercase cursor-pointer"
                >
                  {LIMIT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt} per page</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="flex bg-[#0D1117] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { setSortBy('created_at'); setSortOrder('DESC'); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${sortBy === 'created_at' && sortOrder === 'DESC' ? 'bg-violet-600 text-white' : 'text-gray-500'}`}
              >Newest</button>
              <button
                onClick={() => { setSortBy('created_at'); setSortOrder('ASC'); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${sortBy === 'created_at' && sortOrder === 'ASC' ? 'bg-violet-600 text-white' : 'text-gray-500'}`}
              >Oldest</button>
              <button
                onClick={() => { setSortBy('due_date'); setSortOrder('ASC'); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${sortBy === 'due_date' && sortOrder === 'ASC' ? 'bg-violet-600 text-white' : 'text-gray-500'}`}
              >Due Soon</button>
              <button
                onClick={() => { setSortBy('due_date'); setSortOrder('DESC'); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${sortBy === 'due_date' && sortOrder === 'DESC' ? 'bg-violet-600 text-white' : 'text-gray-500'}`}
              >Due Late</button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4 text-center">Tasks</th>
                  <th className="px-6 py-4 text-center">Progress</th>
                  <th className="px-6 py-4 text-center text-gray-400">Submission Date</th>
                  <th className="px-6 py-4 text-center text-gray-400">Added</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.length > 0 ? projects.map((project) => {
                  const tc    = project.task_counts || {};
                  const total = (tc.todo || 0) + (tc.in_progress || 0) + (tc.done || 0);
                  const pct   = total > 0 ? Math.round(((tc.done || 0) / total) * 100) : 0;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-white/[0.02] transition-all group"
                    >
                      <td className="px-6 py-5 font-mono text-xs text-gray-600">
                        #{String(project.id).padStart(3, '0')}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => { setSelectedProject(project); setIsTaskModalOpen(true); }}
                          className="font-semibold text-left group-hover:text-violet-400 transition-colors hover:text-violet-400"
                        >
                          {project.name}
                        </button>
                        <div className="text-[11px] text-gray-500 mt-0.5 italic">{project.description}</div>
                      </td>

                      {/* Task count pill */}
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase border text-violet-400 border-violet-500/20 bg-violet-500/5">
                          {total} task{total !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Progress bar + % */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      </td>

                      {/* Added date */}
                      <td className="px-6 py-5 text-center text-[10px] font-bold text-amber-400 uppercase">
                        {project.due_date
                          ? new Date(project.due_date).toLocaleDateString('en-GB')
                          : '--/--/--'}
                      </td>
                      <td className="px-6 py-5 text-center text-[10px] font-bold text-gray-500 uppercase">
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString('en-GB')
                          : '--/--/--'}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          disabled={deletingProjectId === project.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 disabled:opacity-60"
                        >
                          <Trash2 size={11} />
                          {deletingProjectId === project.id ? 'Deleting' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-600 text-[11px] uppercase tracking-widest font-bold">
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between shrink-0">
            <p className="text-[10px] text-gray-500 font-mono">
              {totalCount > 0
                ? `${rangeStart}–${rangeEnd} of ${totalCount} project${totalCount !== 1 ? 's' : ''}`
                : 'No projects'}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-600 font-mono">Page {page} of {totalPages || 1}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg bg-[#0D1117] border border-white/10 disabled:opacity-20 hover:border-violet-500/50 transition-all"
                ><ChevronLeft size={16} /></button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg bg-[#0D1117] border border-white/10 disabled:opacity-20 hover:border-violet-500/50 transition-all"
                ><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Modals */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={() => { setPage(1); fetchProjects(); }}
      />
      <TaskListModal
        project={isTaskModalOpen ? selectedProject : null}
        onTaskDeleted={fetchProjects}
        onClose={() => { setIsTaskModalOpen(false); setSelectedProject(null); }}
      />
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ title, count, icon }) => (
  <div className="bg-[#161B22] border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:bg-white/[0.02] transition-all">
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black">{count || 0}</p>
    </div>
    <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
  </div>
);

export default Dashboard;