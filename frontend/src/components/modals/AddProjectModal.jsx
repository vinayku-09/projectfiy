import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import API from '../../api/axios';

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 3,
    due_date: ''
  });
  const [taskDraft, setTaskDraft] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!isOpen) return null;

  const addTaskToList = () => {
    if (!taskDraft.title.trim()) return;
    setTasks((prev) => [...prev, {
      title: taskDraft.title.trim(),
      description: taskDraft.description.trim(),
      status: taskDraft.status,
      priority: taskDraft.priority,
      due_date: taskDraft.due_date || null
    }]);
    setTaskDraft({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
    });
  };

  const removeTaskFromList = (idx) => {
    setTasks((prev) => prev.filter((_, index) => index !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/projects', { ...formData, tasks });
      if (onAdd) onAdd();
      setFormData({ name: '', description: '', priority: 3, due_date: '' });
      setTasks([]);
      setTaskDraft({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161B22] border border-white/10 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tighter">New Registry Node</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">
              Project Entity Name
            </label>
            <input
              required
              type="text"
              className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500 transition text-sm"
              placeholder="e.g., SQL Data Sync"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">
              Technical Description
            </label>
            <textarea
              rows="3"
              className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500 transition resize-none text-sm"
              placeholder="System requirements or goal..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Priority Star Rating */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">
              Priority Ranking
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: num })}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={24}
                    fill={formData.priority >= num ? '#7C3AED' : 'none'}
                    className={formData.priority >= num ? 'text-violet-500' : 'text-gray-700'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">
              Deadline Date
            </label>
            <input
              type="date"
              required
              className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500 transition text-gray-300 text-sm"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          {/* Task Cart Builder */}
          <div className="rounded-2xl border border-white/10 p-4 bg-[#0D1117] space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Add Tasks (like cart items)
            </label>

            <input
              type="text"
              className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500 transition text-sm"
              placeholder="Task title"
              value={taskDraft.title}
              onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })}
            />

            <textarea
              rows="2"
              className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500 transition resize-none text-sm"
              placeholder="Task description"
              value={taskDraft.description}
              onChange={(e) => setTaskDraft({ ...taskDraft, description: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-2">
              <select
                className="bg-[#111827] border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-violet-500"
                value={taskDraft.status}
                onChange={(e) => setTaskDraft({ ...taskDraft, status: e.target.value })}
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>

              <select
                className="bg-[#111827] border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-violet-500"
                value={taskDraft.priority}
                onChange={(e) => setTaskDraft({ ...taskDraft, priority: e.target.value })}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>

              <input
                type="date"
                className="bg-[#111827] border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-violet-500"
                value={taskDraft.due_date}
                onChange={(e) => setTaskDraft({ ...taskDraft, due_date: e.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={addTaskToList}
              className="w-full bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Add Task To Project
            </button>

            {tasks.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {tasks.map((task, idx) => (
                  <div key={`${task.title}-${idx}`} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs font-semibold">{task.title}</p>
                      <p className="text-[10px] text-gray-400">
                        {task.status} • {task.priority} {task.due_date ? `• ${task.due_date}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-[10px] text-rose-400 hover:text-rose-300"
                      onClick={() => removeTaskFromList(idx)}
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-rose-400 text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-xl font-bold transition mt-4 shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Syncing to SQL…' : 'Create Project Node'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;