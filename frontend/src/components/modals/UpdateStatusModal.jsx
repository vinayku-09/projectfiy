import React, { useState, useEffect } from 'react';
import { X, ClipboardList } from 'lucide-react';

const UpdateStatusModal = ({ isOpen, onClose, project, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: 'Active',
    remainingWork: ''
  });

  // Sync state when a specific project is selected
  useEffect(() => {
    if (project) {
      setFormData({
        status: project.status || 'Active',
        remainingWork: project.remaining_work || ''
      });
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(project.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#161B22] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-600/20 rounded-lg text-violet-400">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Update Progress</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Target Project</p>
            <p className="text-white font-semibold">{project.name}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Status</label>
            <select 
              className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-violet-500 outline-none transition"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Work Remaining</label>
            <textarea 
              rows="4"
              className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-violet-500 outline-none transition resize-none"
              placeholder="What tasks are still pending for this project?"
              value={formData.remainingWork}
              onChange={(e) => setFormData({...formData, remainingWork: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-xl font-bold transition shadow-lg shadow-violet-600/20 active:scale-95"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;